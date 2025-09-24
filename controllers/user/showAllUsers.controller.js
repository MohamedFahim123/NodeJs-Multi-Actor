import userModel from "../../models/users.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const showUsersController = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const search = req.query.search;
  const role = req.query.role;

  let query = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const users = await userModel
    .find(query)
    .select("-__v -password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await userModel.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  return successResponse(res, 200, "Users fetched successfully!", {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
    },
  });
});

export default showUsersController;
