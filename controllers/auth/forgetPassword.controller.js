import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { generateOTP, sendOTPEmail } from "../../utils/emailService.js";
import { successResponse } from "../../utils/responseHandler.js";

export const forgetPasswordController = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return successResponse(
      res,
      200,
      "If the email exists, OTP has been sent",
      null
    );
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(email, otp);
    return successResponse(res, 200, "OTP sent successfully", null);
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Failed to send OTP email", 500));
  }
});
