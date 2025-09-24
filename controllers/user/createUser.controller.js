// controllers/user/createUserController.js
import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const createUserController = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone } = req.body;

  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path.replace("uploads/", "");
  }

  const userEmailExists = await userModel.findOne({ email });
  if (userEmailExists) {
    const err = new AppError("User already exists", 409, {
      email: "Email Has Already Been Taken",
    });
    return next(err);
  }

  const userPhoneExists = await userModel.findOne({ phone });
  if (userPhoneExists) {
    const err = new AppError("User already exists", 409, {
      phone: "Phone Number Has Already Been Taken",
    });
    return next(err);
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

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  delete userWithoutPassword.__v;

  return successResponse(
    res,
    200,
    "User created successfully",
    userWithoutPassword
  );
});

export default createUserController;
