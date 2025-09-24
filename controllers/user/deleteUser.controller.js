import userModel from "../../models/users.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const deleteUserController = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExists = await userModel.findById(id);
  if (!userExists) {
    const err = new AppError("User not found", 404);
    return next(err);
  }

  const user = await userModel.findByIdAndDelete(id).select("-__v -password");
  return successResponse(res, 200, "User deleted successfully", user);
});

export default deleteUserController;
