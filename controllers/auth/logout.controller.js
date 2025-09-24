import { addToBlacklist } from "../../middlewares/checkAuth.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";

const logoutController = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) addToBlacklist(token);

  return successResponse(res, 200, "Logout successful", null);
});

export default logoutController;
