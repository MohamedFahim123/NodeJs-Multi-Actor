import mongoose from "mongoose";
import Order from "../../models/orders.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getOrderById = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError("Invalid order ID", 400));
  }

  let order;

  if (req.user.role === "admin") {
    order = await Order.findById(orderId)
      .populate("userId", "firstName lastName email")
      .populate("sellers", "firstName lastName email");
  } else if (req.user.role === "seller") {
    order = await Order.findOne({
      _id: orderId,
      sellers: { $in: [new mongoose.Types.ObjectId(req.user.id)] },
    })
      .populate("userId", "firstName lastName email")
      .populate("sellers", "firstName lastName email");

    if (!order) {
      return next(
        new AppError(
          "Order not found or you are not authorized to view it",
          404
        )
      );
    }

    const sellerItems = order.items.filter(
      (item) => item.sellerId.toString() === req.user.id
    );

    const sellerOrder = {
      ...order.toObject(),
      items: sellerItems,
      sellerTotalPrice: sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      sellerTotalQuantity: sellerItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      isPartialOrder: order.items.length > sellerItems.length,
    };

    return successResponse(res, 200, "Order fetched successfully", {
      order: sellerOrder,
      note: "Showing only your products from this order",
    });
  } else if (req.user.role === "user") {
    order = await Order.findOne({
      _id: orderId,
      userId: new mongoose.Types.ObjectId(req.user.id),
    })
      .populate("userId", "firstName lastName email")
      .populate("sellers", "firstName lastName email");

    if (!order) {
      return next(
        new AppError(
          "Order not found or you are not authorized to view it",
          404
        )
      );
    }
  } else {
    return next(new AppError("Invalid user role", 403));
  }

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  return successResponse(res, 200, "Order fetched successfully", { order });
});

export default getOrderById;
