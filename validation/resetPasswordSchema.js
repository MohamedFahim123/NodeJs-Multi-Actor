import Joi from "joi";
import { patterns } from "../utils/variables.js";

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().pattern(patterns.email).messages({
    "string.empty": "Email is required",
    "string.email": "Email is not valid",
    "string.pattern.base": "Email is not valid",
    "any.required": "Email is required",
  }),
  otp: Joi.string().required().messages({
    "string.empty": "OTP is required",
    "any.required": "OTP is required",
  }),
  newPassword: Joi.string()
    .min(6)
    .pattern(patterns.password)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.pattern.base": "Password is not valid",
      "any.required": "Password is required",
    }),
});

export default resetPasswordSchema;
