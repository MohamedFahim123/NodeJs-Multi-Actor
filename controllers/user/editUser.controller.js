import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const editUserController = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userData = req.body;

  const userExists = await userModel.findById(id);
  if (!userExists) {
    return next(new AppError("User not found", 404));
  }

  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path.replace("uploads/", "");
  }

  if (userData.email) {
    const userEmailExists = await userModel.findOne({
      email: userData.email,
      _id: { $ne: id },
    });
    if (userEmailExists) {
      return next(
        new AppError("Email has already been taken", 409, {
          email: "Email has already been taken",
        })
      );
    }
  }

  if (userData.phone) {
    const userPhoneExists = await userModel.findOne({
      phone: userData.phone,
      _id: { $ne: id },
    });
    if (userPhoneExists) {
      return next(
        new AppError("Phone number has already been taken", 409, {
          phone: "Phone number has already been taken",
        })
      );
    }
  }

  const updateData = { ...userData };
  if (imagePath) {
    updateData.image = imagePath;
  }

  const updatedUser = await userModel
    .findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .select("-__v -password");

  return successResponse(res, 200, "User updated successfully", updatedUser);
});

export default editUserController;
