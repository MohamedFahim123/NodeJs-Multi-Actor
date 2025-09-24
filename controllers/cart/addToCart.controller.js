import Cart from "../../models/cart.js";
import ProductsMongooseSchema from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const addToCartController = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  const product = await ProductsMongooseSchema.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (quantity && quantity > product.stock) {
    return next(new AppError("Quantity exceeds stock", 400));
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (existingItemIndex > -1) {
    if (cart.items[existingItemIndex].quantity + quantity > product.stock) {
      return next(new AppError("Quantity exceeds stock", 400));
    }

    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      price: product.price,
    });
  }

  await cart.save();
  await cart.populate("items.productId", "name price images stock sellerId");

  return successResponse(res, 200, "Product added to cart", cart);
});

export default addToCartController;
