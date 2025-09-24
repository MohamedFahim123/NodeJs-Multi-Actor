import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const showUserController = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel.findById(id).select("-__v -password");

  if (!user) {
    const err = new AppError("User not found", 404);
    return next(err);
  }

  return successResponse(res, 200, "User fetched successfully!", user);
});

export default showUserController;
