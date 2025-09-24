import Joi from "joi";

const addToCartJoiSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Product ID is required",
    "string.hex": "Product ID must be a valid hexadecimal",
    "string.length": "Product ID must be 24 characters",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().min(1).default(1).messages({
    "number.min": "Quantity must be at least 1",
  }),
});

const updateCartItemJoiSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Product ID is required",
    "string.hex": "Product ID must be a valid hexadecimal",
    "string.length": "Product ID must be 24 characters",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().min(0).required().messages({
    "number.min": "Quantity cannot be negative",
    "any.required": "Quantity is required",
  }),
});

export { addToCartJoiSchema, updateCartItemJoiSchema };
