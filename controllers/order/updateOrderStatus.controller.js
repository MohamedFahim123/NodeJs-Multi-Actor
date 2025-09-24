import mongoose from "mongoose";
import Order from "../../models/orders.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";
import { updateOrderStatusSchema } from "../../validation/ordersSchema.js";

const updateOrderStatus = catchAsync(async (req, res, next) => {
  if (!req.body) return next(new AppError("No data provided", 400));

  const { error } = updateOrderStatusSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const orderId = req.params.id;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError("Invalid order ID", 400));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (req.user.role === "admin") {
  } else if (req.user.role === "seller") {
    const hasSellerProducts = order.items.some(
      (item) => item.sellerId && item.sellerId.toString() === req.user.id
    );

    if (!hasSellerProducts) {
      return next(
        new AppError(
          "Not authorized to update this order. This order does not contain your products.",
          403
        )
      );
    }

    const sellerAllowedStatuses = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
    };

    const allowedStatuses = sellerAllowedStatuses[order.status] || [];

    if (!allowedStatuses.includes(status)) {
      return next(
        new AppError(
          `Sellers cannot change order status from "${
            order.status
          }" to "${status}". Allowed transitions: ${allowedStatuses.join(
            ", "
          )}`,
          400
        )
      );
    }

    if (order.sellers && order.sellers.length > 1) {
      if (status === "delivered") {
        return next(
          new AppError(
            "Multi-seller order delivery tracking not yet implemented. Please contact admin.",
            400
          )
        );
      }
    }
  } else if (req.user.role === "user") {
    return next(
      new AppError("Users are not authorized to update order status", 403)
    );
  } else {
    return next(new AppError("Invalid user role", 403));
  }

  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
    partially_cancelled: ["cancelled"],
  };

  const allowedTransitions = validTransitions[order.status] || [];

  if (!allowedTransitions.includes(status)) {
    return next(
      new AppError(
        `Cannot change order status from "${
          order.status
        }" to "${status}". Valid transitions: ${allowedTransitions.join(", ")}`,
        400
      )
    );
  }

  if (status === "shipped" && order.status !== "confirmed") {
    return next(
      new AppError("Order must be confirmed before it can be shipped", 400)
    );
  }

  if (status === "delivered" && order.status !== "shipped") {
    return next(
      new AppError("Order must be shipped before it can be delivered", 400)
    );
  }

  order.status = status;

  if (status === "delivered") {
    order.deliveredAt = new Date();
  } else if (status === "shipped") {
    order.shippedAt = new Date();
  }

  await order.save();

  await order.populate([
    { path: "userId", select: "firstName lastName email" },
    { path: "sellers", select: "firstName lastName email" },
  ]);

  let message = "Order status updated successfully";
  if (req.user.role === "seller") {
    message = "Your products' status updated successfully";
  }

  return successResponse(res, 200, message, {
    order,
    previousStatus: order.status,
    updatedBy: {
      role: req.user.role,
      userId: req.user.id,
    },
  });
});

export default updateOrderStatus;
