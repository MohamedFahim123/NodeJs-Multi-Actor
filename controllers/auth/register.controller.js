import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const registerController = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone } = req.body;

  const userPhoneExists = await userModel.findOne({ phone });
  if (userPhoneExists) {
    const err = new AppError("User already exists", 409, {
      phone: "Phone Number Has Already Been Taken",
    });
    return next(err);
  }

  const userEmailExists = await userModel.findOne({ email });
  if (userEmailExists) {
    const err = new AppError("User already exists", 409, {
      email: "Email Has Already Been Taken",
    });
    return next(err);
  }

  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path.replace("uploads/", "");
  }

  const user = await userModel.create({
    firstName,
    lastName,
    email,
    password,
    role: role || "user",
    image: imagePath,
    phone,
  });

  const userWithoutSensitiveData = user.toObject();
  delete userWithoutSensitiveData.resetPasswordOTP;
  delete userWithoutSensitiveData.resetPasswordExpires;

  return successResponse(
    res,
    201,
    "User registered successfully",
    userWithoutSensitiveData
  );
});

export default registerController;
