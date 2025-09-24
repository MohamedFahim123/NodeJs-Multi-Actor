import jwt from "jsonwebtoken";
import ProductsMongooseSchema from "../../models/products.js";
import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getSingleProductController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { authorization } = req.headers;

  const productExists = await ProductsMongooseSchema.findById(id);
  if (!productExists) {
    return next(new AppError("Product not found", 404));
  }

  let shouldShowLimitedFields = true;
  let populateFields = "firstName lastName";

  if (authorization) {
    let token = authorization;
    if (token.includes("Bearer")) {
      token = token.split(" ")[1];
    }

    let user = null;
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      user = await userModel.findById(decoded.id);
    } catch (error) {
      user = null;
    }

    if (user) {
      if (user.role !== "seller") {
        shouldShowLimitedFields = false;
        populateFields = "firstName lastName email phone";
      } else if (
        user.role === "seller" &&
        user.id !== productExists.sellerId.toString()
      ) {
        return next(
          new AppError("You are not authorized to view this product", 403)
        );
      } else {
        shouldShowLimitedFields = false;
        populateFields = "firstName lastName email phone";
      }
    }
  }

  let query = ProductsMongooseSchema.findById(id).populate(
    "sellerId",
    populateFields
  );

  if (shouldShowLimitedFields) {
    query = query.select("-images -description -createdAt -updatedAt");
  }

  const product = await query;

  return successResponse(res, 200, "Product fetched successfully!", product);
});

export default getSingleProductController;
