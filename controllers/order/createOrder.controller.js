import mongoose from "mongoose";
import Cart from "../../models/cart.js";
import Order from "../../models/orders.js";
import Product from "../../models/products.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/responseHandler.js";
import { createOrderSchema } from "../../validation/ordersSchema.js";
import {
  createCheckoutSession,
  createPaymentIntent,
  createStripeCustomer,
} from "./payment.controller.js";

const createOrder = catchAsync(async (req, res, next) => {
  if (!req.body) return next(new AppError("No data provided", 400));

  const { error } = createOrderSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { cartId, shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  const cart = await Cart.findOne({ _id: cartId, userId }).populate({
    path: "items.productId",
    select: "title thumbnail stock sellerId",
    populate: {
      path: "sellerId",
      select: "_id",
    },
  });

  if (!cart) {
    return next(new AppError("Cart not found or doesn't belong to you", 404));
  }

  if (!cart.items || cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) {
      return next(new AppError(`Product not found`, 404));
    }

    if (!product.sellerId) {
      return next(
        new AppError(`Product ${product.title} has no seller assigned`, 400)
      );
    }

    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product: ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        )
      );
    }
  }

  const orderItems = [];
  const sellerSet = new Set();

  for (const item of cart.items) {
    const product = item.productId;

    let sellerId;
    if (product.sellerId._id) {
      sellerId = product.sellerId._id.toString();
    } else {
      sellerId = product.sellerId.toString();
    }

    const orderItem = {
      productId: product._id,
      sellerId: new mongoose.Types.ObjectId(sellerId),
      quantity: item.quantity,
      price: item.price,
      title: product.title,
      thumbnail: product.thumbnail,
    };

    orderItems.push(orderItem);
    sellerSet.add(sellerId);
  }

  const sellers = Array.from(sellerSet).map(
    (sellerId) => new mongoose.Types.ObjectId(sellerId)
  );

  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = cart.total;

  const order = new Order({
    userId,
    cartId: cart._id,
    items: orderItems,
    totalPrice,
    totalQuantity,
    shippingAddress,
    paymentMethod,
    status: "pending",
    paymentStatus: "pending",
    sellers: sellers,
  });

  let paymentData = null;

  if (paymentMethod === "stripe") {
    try {
      const session = await createCheckoutSession(order, req.user);
      order.stripeSessionId = session.id;
      paymentData = {
        sessionId: session.id,
        url: session.url,
        type: "checkout_session",
      };
    } catch (error) {
      return next(
        new AppError(`Stripe payment setup failed: ${error.message}`, 400)
      );
    }
  } else if (
    paymentMethod === "credit_card" ||
    paymentMethod === "debit_card"
  ) {
    try {
      const customer = await createStripeCustomer(req.user, order);
      order.stripeCustomerId = customer.id;

      const paymentIntent = await createPaymentIntent(order, customer.id);
      order.stripePaymentIntentId = paymentIntent.id;

      paymentData = {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        type: "payment_intent",
      };
    } catch (error) {
      return next(new AppError(`Payment setup failed: ${error.message}`, 400));
    }
  }

  if (paymentMethod === "cash_on_delivery") {
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();

    order.paymentStatus = "paid";
  }

  await order.save();

  await order.populate([
    { path: "userId", select: "firstName lastName email" },
    { path: "sellers", select: "firstName lastName email" },
    { path: "items.productId", select: "title thumbnail" },
  ]);

  const responseData = {
    order: order.orderSummary,
    orderDetails: order,
  };

  if (paymentData) {
    responseData.payment = paymentData;
  }

  return successResponse(res, 201, "Order created successfully", responseData);
});

export default createOrder;
