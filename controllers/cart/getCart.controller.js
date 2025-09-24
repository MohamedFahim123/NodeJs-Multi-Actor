import Cart from "../../models/cart.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getCartController = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user.id }).populate(
    "items.productId",
    "name price images stock sellerId"
  );

  if (!cart) {
    return successResponse(res, 200, "Cart is empty", { items: [], total: 0 });
  }

  return successResponse(res, 200, "Cart fetched successfully", cart);
});

export default getCartController;
