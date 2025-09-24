import Joi from "joi";
import { patterns } from "../utils/variables.js";

const forgetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .pattern(patterns.email)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Email is not valid",
      "any.required": "Email is required",
    }),
});

export default forgetPasswordSchema;
