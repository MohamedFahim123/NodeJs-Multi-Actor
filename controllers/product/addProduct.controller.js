import ProductsMongooseSchema from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const addProductController = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { title, price, category, stock, description } = req.body;

  const IsProductExists = await ProductsMongooseSchema.findOne({
    title: { $regex: new RegExp(title, "i") },
  });

  if (IsProductExists) {
    const err = new AppError("Product with this title already exists", 409);
    return next(err);
  }

  let thumbnailPath = null;
  let imagesPaths = [];

  if (req.files) {
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnailPath = req.files.thumbnail[0].path.replace("uploads/", "");
    }

    if (req.files.images) {
      imagesPaths = req.files.images.map((file) =>
        file.path.replace("uploads/", "")
      );
    }
  }

  if (!thumbnailPath) {
    return next(new AppError("Thumbnail is required", 400));
  }

  if (imagesPaths.length === 0) {
    return next(new AppError("At least one product image is required", 400));
  }

  const product = await ProductsMongooseSchema.create({
    thumbnail: thumbnailPath,
    images: imagesPaths,
    title,
    description,
    price: parseFloat(price),
    stock: parseInt(stock),
    category,
    sellerId: user.id,
  }).populate("sellerId","firstName lastName email phone");

  return successResponse(res, 201, "Product added successfully!", product);
});

export default addProductController;
