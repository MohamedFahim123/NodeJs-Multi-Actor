import Joi from "joi";

const orderItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Product ID must be a valid hexadecimal string",
    "string.length": "Product ID must be 24 characters long",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "number.integer": "Quantity must be an integer",
    "any.required": "Quantity is required",
  }),
  price: Joi.number().min(0).required().messages({
    "number.min": "Price must be at least 0",
    "any.required": "Price is required",
  }),
  title: Joi.string().min(1).max(100).required().messages({
    "string.min": "Title must be at least 1 character long",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),
  thumbnail: Joi.string().uri().required().messages({
    "string.uri": "Thumbnail must be a valid URL",
    "any.required": "Thumbnail is required",
  }),
});

const shippingAddressSchema = Joi.object({
  street: Joi.string().min(1).max(200).required().messages({
    "string.min": "Street address is required",
    "string.max": "Street address cannot exceed 200 characters",
    "any.required": "Street address is required",
  }),
  city: Joi.string().min(1).max(100).required().messages({
    "string.min": "City is required",
    "string.max": "City cannot exceed 100 characters",
    "any.required": "City is required",
  }),
  state: Joi.string().min(1).max(100).required().messages({
    "string.min": "State is required",
    "string.max": "State cannot exceed 100 characters",
    "any.required": "State is required",
  }),
  country: Joi.string().min(1).max(100).required().messages({
    "string.min": "Country is required",
    "string.max": "Country cannot exceed 100 characters",
    "any.required": "Country is required",
  }),
  zipCode: Joi.string().min(1).max(20).required().messages({
    "string.min": "ZIP code is required",
    "string.max": "ZIP code cannot exceed 20 characters",
    "any.required": "ZIP code is required",
  }),
});

export const createOrderSchema = Joi.object({
  cartId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Cart ID must be a valid hexadecimal string",
    "string.length": "Cart ID must be 24 characters long",
    "any.required": "Cart ID is required",
  }),
  shippingAddress: shippingAddressSchema.required().messages({
    "any.required": "Shipping address is required",
  }),
  paymentMethod: Joi.string()
    .valid("credit_card", "debit_card", "stripe", "cash_on_delivery")
    .default("cash_on_delivery")
    .messages({
      "any.only":
        "Payment method must be one of: credit_card, debit_card, stripe, cash_on_delivery",
    }),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .required()
    .messages({
      "any.only":
        "Status must be one of: pending, confirmed, shipped, delivered, cancelled",
      "any.required": "Status is required",
    }),
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled"
  ),
  search: Joi.string().max(100),
});

export { orderItemSchema, shippingAddressSchema };

export default {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
};