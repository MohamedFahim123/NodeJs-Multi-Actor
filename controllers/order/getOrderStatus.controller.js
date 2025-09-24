import Order from "../../models/orders.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getOrderStats = catchAsync(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalOrders: 1,
        totalRevenue: 1,
        pendingOrders: 1,
        deliveredOrders: 1,
        cancelledOrders: 1,
      },
    },
  ]);

  const monthlyStats = await Order.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  return successResponse(res, 200, "Order statistics fetched successfully", {
    overview: stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
    },
    monthlyStats,
  });
});

export default getOrderStats;