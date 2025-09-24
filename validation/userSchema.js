import Joi from "joi";
import { patterns } from "../utils/variables.js";

const createUserJoiSchema = Joi.object({
  firstName: Joi.string().min(3).max(20).trim().required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 3 characters",
    "string.max": "First name must be at most 20 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().min(3).max(20).trim().required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 3 characters",
    "string.max": "Last name must be at most 20 characters",
    "any.required": "Last name is required",
  }),

  phone: Joi.string().pattern(patterns.phone).required().messages({
    "string.empty": "Phone is required",
    "string.pattern.base": "Phone number is not valid",
    "any.required": "Phone is required",
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email is not valid",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).pattern(patterns.password).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.pattern.base": "Password is not valid",
    "any.required": "Password is required",
  }),

  role: Joi.string().valid("admin", "seller", "user").default("user").messages({
    "any.only": "Role must be either admin, seller, or user",
  }),
});

const updatUserJoiSchema = Joi.object({
  image: Joi.string().uri().allow(null, "").optional(),

  firstName: Joi.string().min(3).max(20).trim().optional(),

  lastName: Joi.string().min(3).max(20).trim().optional(),

  phone: Joi.string().pattern(patterns.phone).optional().messages({
    "string.pattern.base": "Phone number is not valid",
  }),

  email: Joi.string().email().lowercase().trim().optional().messages({
    "string.email": "Email is not valid",
  }),

  password: Joi.string().min(6).pattern(patterns.password).optional().messages({
    "string.min": "Password must be at least 6 characters",
    "string.pattern.base": "Password is not valid",
  }),

  role: Joi.string().valid("admin", "seller", "user").optional().messages({
    "any.only": "Role must be either admin, seller, or user",
  }),
});

export { createUserJoiSchema, updatUserJoiSchema };
