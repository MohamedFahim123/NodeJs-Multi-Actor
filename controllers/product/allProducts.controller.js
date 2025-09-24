import { decodeAndPutUserInRequestObj } from "../../middlewares/checkAuth.js";
import ProductsMongooseSchema from "../../models/products.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";
import mongoose from "mongoose";

const showAllProductsController = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!authorization) {
    const products = await ProductsMongooseSchema.find({})
      .sort({ createdAt: -1 })
      .select("-images -description -createdAt -updatedAt")
      .populate("sellerId", "firstName lastName")
      .skip(skip)
      .limit(limit);

    const totalProducts = await ProductsMongooseSchema.countDocuments({});
    const totalPages = Math.ceil(totalProducts / limit);

    return successResponse(res, 200, "Products fetched successfully!", {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    });
  }

  let token = authorization;
  if (token.includes("Bearer")) {
    token = token.split(" ")[1];
  }

  let user = null;

  try {
    const tempReq = {};
    await decodeAndPutUserInRequestObj(token, tempReq, res, (err) => {
      if (err) {
        user = null;
      }
    });
    user = tempReq.user;
  } catch (error) {
    user = null;
  }

  if (user && user.role === "seller") {
    const possibleSellerIds = [user.id].filter(Boolean);

    let sellerProducts = [];
    let totalProducts = 0;

    for (const sellerId of possibleSellerIds) {
      if (mongoose.Types.ObjectId.isValid(sellerId)) {
        const objectId = new mongoose.Types.ObjectId(sellerId);

        const productsWithObjectId = await ProductsMongooseSchema.find({
          sellerId: objectId,
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const productsWithString = await ProductsMongooseSchema.find({}).sort({
          createdAt: -1,
        });

        const filteredProducts = productsWithString
          .filter(
            (product) => product.sellerId.toString() === sellerId.toString()
          )
          .slice(skip, skip + limit);

        if (productsWithObjectId.length > filteredProducts.length) {
          sellerProducts = productsWithObjectId;
          totalProducts = await ProductsMongooseSchema.countDocuments({
            sellerId: objectId,
          });
        } else {
          sellerProducts = filteredProducts;
          totalProducts = productsWithString.filter(
            (product) => product.sellerId.toString() === sellerId.toString()
          ).length;
        }

        if (sellerProducts.length > 0) break;
      }
    }

    const totalPages = Math.ceil(totalProducts / limit);

    return successResponse(res, 200, "Products fetched successfully!", {
      products: sellerProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit,
      },
    });
  }

  const products = await ProductsMongooseSchema.find({})
    .sort({ createdAt: -1 })
    .populate("sellerId", "firstName lastName")
    .skip(skip)
    .limit(limit);

  const totalProducts = await ProductsMongooseSchema.countDocuments({});
  const totalPages = Math.ceil(totalProducts / limit);

  return successResponse(res, 200, "Products fetched successfully!", {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
    },
  });
});

export default showAllProductsController;
