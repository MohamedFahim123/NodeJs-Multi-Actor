import mongoose from "mongoose";
import Order from "../../models/orders.js";
import Product from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const cancelOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError("Invalid order ID", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (req.user.role === "admin") {
    if (!["pending", "confirmed"].includes(order.status)) {
      return next(
        new AppError(
          `Admins can only cancel orders with status "pending" or "confirmed". Current status: ${order.status}`,
          400
        )
      );
    }
  } else if (req.user.role === "seller") {
    const hasSellerProducts = order.items.some(
      (item) => item.sellerId && item.sellerId.toString() === req.user.id
    );

    if (!hasSellerProducts) {
      return next(
        new AppError(
          "Not authorized to cancel this order. This order does not contain your products.",
          403
        )
      );
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return next(
        new AppError(
          `Sellers can only cancel orders with status "pending" or "confirmed". Current status: ${order.status}`,
          400
        )
      );
    }
  } else if (req.user.role === "user") {
    if (order.userId.toString() !== req.user.id) {
      return next(new AppError("Not authorized to cancel this order", 403));
    }

    if (order.status !== "pending") {
      return next(
        new AppError(
          `You can only cancel orders with status "pending". Current status: ${order.status}`,
          400
        )
      );
    }
  } else {
    return next(new AppError("Invalid user role", 403));
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    return next(
      new AppError(`Cannot cancel order with status: ${order.status}`, 400)
    );
  }

  if (req.user.role === "seller") {
    const sellerItems = order.items.filter(
      (item) => item.sellerId && item.sellerId.toString() === req.user.id
    );

    for (const item of sellerItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    if (sellerItems.length < order.items.length) {
      order.status = "partially_cancelled";
      await order.save();

      return successResponse(
        res,
        200,
        "Your products have been cancelled from the order",
        {
          order,
          note: "Only your products were cancelled. Other items in the order remain active.",
        }
      );
    }
  } else {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  order.status = "cancelled";
  await order.save();

  return successResponse(res, 200, "Order cancelled successfully", { order });
});

export default cancelOrder;
