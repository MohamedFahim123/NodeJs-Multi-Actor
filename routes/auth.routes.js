import express from "express";
import { forgetPasswordController } from "../controllers/auth/forgetPassword.controller.js";
import loginController from "../controllers/auth/login.controller.js";
import logoutController from "../controllers/auth/logout.controller.js";
import { resendOTP } from "../controllers/auth/otp.controller.js";
import registerController from "../controllers/auth/register.controller.js";
import { resetPasswordController } from "../controllers/auth/resetPassword.controller.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import checkValidation from "../middlewares/checkValidation.js";
import uploadFile from "../middlewares/uploadfile.js";
import forgetPasswordSchema from "../validation/forgetPasswordSchema.js";
import loginSchema from "../validation/loginSchema.js";
import resetPasswordSchema from "../validation/resetPasswordSchema.js";
import { createUserJoiSchema as registerSchema } from "../validation/userSchema.js";

const authRouter = express.Router();

authRouter
  .post(
    "/register",
    uploadFile.single("image"),
    checkValidation(registerSchema),
    registerController
  )
  .post("/login", checkValidation(loginSchema), loginController)
  .post(
    "/forget-password",
    checkValidation(forgetPasswordSchema),
    forgetPasswordController
  )
  .post(
    "/reset-password",
    checkValidation(resetPasswordSchema),
    resetPasswordController
  )
  .post("/resend-otp", checkValidation(forgetPasswordSchema), resendOTP)
  .post("/logout", checkAuth, logoutController);

export default authRouter;
