import ProductsMongooseSchema from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const deleteProductController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  const productExists = await ProductsMongooseSchema.findById(id);

  if (!productExists) {
    const err = new AppError("Product not found", 404);
    return next(err);
  }

  if (user.id !== productExists.sellerId.toString()) {
    const err = new AppError(
      "You are not authorized to delete this product",
      403
    );
    return next(err);
  }

  const product = await ProductsMongooseSchema.findByIdAndDelete(id);

  return successResponse(res, 200, "Product deleted successfully", product);
});

export default deleteProductController;
