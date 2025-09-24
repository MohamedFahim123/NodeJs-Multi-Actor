import Cart from "../../models/cart.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const clearCartController = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return successResponse(res, 200, "Cart is already empty", {
      items: [],
      total: 0,
    });
  }

  cart.items = [];
  await cart.save();

  return successResponse(res, 200, "Cart cleared successfully", cart);
});

export default clearCartController;
