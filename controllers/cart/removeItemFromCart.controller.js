import Cart from "../../models/cart.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const removeFromCartController = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();
  await cart.populate("items.productId", "name price images");

  return successResponse(res, 200, "Product removed from cart", cart);
});

export default removeFromCartController;
