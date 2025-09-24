import Order from "../../models/orders.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";
import { orderQuerySchema } from "../../validation/ordersSchema.js";
import AppError from "../../utils/appError.js";

const getAllOrders = catchAsync(async (req, res, next) => {
  const { error, value } = orderQuerySchema.validate(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { page, limit, status, search } = value;
  const skip = (page - 1) * limit;

  let query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { "items.title": { $regex: search, $options: "i" } },
      { "shippingAddress.city": { $regex: search, $options: "i" } },
      { "shippingAddress.country": { $regex: search, $options: "i" } },
    ];
  }

  const orders = await Order.find(query)
    .populate("userId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalOrders / limit);

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
  });
});

export default getAllOrders;