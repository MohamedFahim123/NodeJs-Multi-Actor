import ProductsMongooseSchema from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const updateProductController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  const product = await ProductsMongooseSchema.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (user.role === "seller" && user.id !== product.sellerId.toString()) {
    return next(
      new AppError("You are not authorized to update this product", 403)
    );
  }

  const allowedUpdates = [
    "title",
    "price",
    "description",
    "category",
    "stock",
    "thumbnail",
    "images",
  ];

  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(new AppError("Invalid updates!", 400));
  }

  const updatedProduct = await ProductsMongooseSchema.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  ).populate("sellerId","firstName lastName email phone");

  if (!updatedProduct) {
    return next(new AppError("Product update failed", 500));
  }

  return successResponse(
    res,
    200,
    "Product updated successfully",
    updatedProduct
  );
});

export default updateProductController;
