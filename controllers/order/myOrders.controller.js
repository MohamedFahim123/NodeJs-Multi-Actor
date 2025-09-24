import Order from "../../models/orders.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";
import { orderQuerySchema } from "../../validation/ordersSchema.js";
import AppError from "../../utils/appError.js";
import mongoose from "mongoose";

const getMyOrders = catchAsync(async (req, res, next) => {
  const { error, value } = orderQuerySchema.validate(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { page, limit, status } = value;
  const skip = (page - 1) * limit;
  const userId = req.user.id;
  const userRole = req.user.role;

  let query = {};
  let orders;

  if (userRole === "seller") {
    query = {
      sellers: new mongoose.Types.ObjectId(userId),
    };
    if (status) query.status = status;

    orders = await Order.find(query)
      .populate("userId", "firstName lastName email")
      .populate("sellers", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  } else {
    query = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) query.status = status;

    orders = await Order.find(query)
      .populate("userId", "firstName lastName email")
      .populate("sellers", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / limit);

  if (userRole === "seller") {
    orders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId.toString() === userId
      );

      const sellerTotalPrice = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const sellerTotalQuantity = sellerItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        ...order.toObject(),
        items: sellerItems,
        sellerTotalPrice,
        sellerTotalQuantity,
        isPartialOrder: order.items.length > sellerItems.length,
      };
    });
  }

  return successResponse(res, 200, "Orders fetched successfully", {
    orders,
    pagination: {
      currentPage: page,
      totalPages,
      totalOrders,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
    },
    userRole,
  });
});

export default getMyOrders;
