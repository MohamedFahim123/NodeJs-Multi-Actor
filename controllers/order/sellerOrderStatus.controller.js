import mongoose from "mongoose";
import Order from "../../models/orders.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getSellerOrderStats = catchAsync(async (req, res) => {
  const sellerId = req.user.id;

  const stats = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.sellerId": new mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $addToSet: "$_id" },
        totalRevenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
        totalItemsSold: { $sum: "$items.quantity" },
        pendingOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      "$items.sellerId",
                      new mongoose.Types.ObjectId(sellerId),
                    ],
                  },
                  { $eq: ["$status", "pending"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        deliveredOrders: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: [
                      "$items.sellerId",
                      new mongoose.Types.ObjectId(sellerId),
                    ],
                  },
                  { $eq: ["$status", "delivered"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalOrders: { $size: "$totalOrders" },
        totalRevenue: 1,
        totalItemsSold: 1,
        pendingOrders: 1,
        deliveredOrders: 1,
      },
    },
  ]);

  const monthlyStats = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.sellerId": new mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        orders: { $addToSet: "$_id" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        itemsSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
    {
      $project: {
        _id: 0,
        period: "$_id",
        orders: { $size: "$orders" },
        revenue: 1,
        itemsSold: 1,
      },
    },
  ]);

  return successResponse(
    res,
    200,
    "Seller order statistics fetched successfully",
    {
      overview: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
      },
      monthlyStats,
    }
  );
});

export default getSellerOrderStats;
