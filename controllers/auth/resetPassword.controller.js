import bcryptjs from "bcryptjs";
import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

export const resetPasswordController = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(new AppError("Email, OTP, and new password are required", 400));
  }

  const user = await userModel.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  const isSamePassword = await bcryptjs.compare(newPassword, user.password);
  if (isSamePassword) {
    return next(
      new AppError("New password cannot be the same as current password", 400, {
        password: "New password must be different from your current password",
      })
    );
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return successResponse(res, 200, "Password reset successfully", null);
});
