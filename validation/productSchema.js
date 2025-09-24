import Joi from "joi";
import { availableCategories } from "../utils/variables.js";

const addNewProductSchema = Joi.object({
  title: Joi.string().required().min(3).max(20).trim(),
  description: Joi.string().required().min(3).max(100).trim(),
  price: Joi.number().required().min(0),
  stock: Joi.number().required().min(0),
  category: Joi.string()
    .required()
    .valid(...availableCategories),
});

const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(20).optional(),
  description: Joi.string().min(3).max(100).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  category: Joi.string()
    .valid(...availableCategories)
    .optional(),
});

export { addNewProductSchema, updateProductSchema };
