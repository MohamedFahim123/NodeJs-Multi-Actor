import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .required()
    .messages({
      "string.empty": "Please enter your email address",
      "any.required": "Email address is required",
      "string.email": "Please enter a valid email address",
    }),

  password: Joi.string().trim().required().messages({
    "string.empty": "Please enter your password",
    "any.required": "Password is required",
  }),
});

export default loginSchema;
