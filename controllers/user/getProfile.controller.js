import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getProfileController = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError("You must be logged in to view your profile", 401)
    );
  }

  const user = await userModel.findById(req.user.id).select("-password -__v -resetPasswordOTP -resetPasswordExpires -createdAt -updatedAt");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  return successResponse(res, 200, "Profile fetched successfully!", user);
});

export default getProfileController;
