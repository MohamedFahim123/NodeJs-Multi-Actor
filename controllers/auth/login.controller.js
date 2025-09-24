import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const getTokenExpiration = (role) => {
  switch (role) {
    case "admin":
      return "7d";
    case "seller":
      return "3d";
    default:
      return "1d";
  }
};

const loginController = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isValid = await bcryptjs.compare(password, user.password);
  if (!isValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Generate token
  const token = jwt.sign(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: getTokenExpiration(user.role),
    }
  );

  return successResponse(res, 200, "Login successful", {
    token,
  });
});

export default loginController;
