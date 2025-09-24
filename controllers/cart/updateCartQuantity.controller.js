import Cart from "../../models/cart.js";
import ProductsMongooseSchema from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const updateCartItemController = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (quantity === 0) {
    return removeFromCartController(req, res, next);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new AppError("Product not found in cart", 404));
  }

  const product = await ProductsMongooseSchema.findById(productId);

  if (product.stock < quantity) {
    return next(new AppError("Quantity exceeds stock", 400));
  }

  if (cart.items[itemIndex].productId.stock < quantity) {
    return next(new AppError("Quantity exceeds stock", 400));
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate("items.productId", "name price images stock sellerId");

  return successResponse(res, 200, "Cart updated successfully", cart);
});

export default updateCartItemController;
