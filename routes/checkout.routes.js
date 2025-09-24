import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
} from "../controllers/order/payment.controller.js";
import stripeWebhook from "../controllers/order/webhook.controller.js";
import { checkAuth } from "../middlewares/checkAuth.js";

const checkoutRouter = express.Router();

// Webhook endpoint (must be before express.json() middleware)
checkoutRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Protected routes
checkoutRouter.use(checkAuth);
checkoutRouter.post("/create-payment-intent", createPaymentIntent);
checkoutRouter.post("/confirm-payment", confirmPayment);
checkoutRouter.get("/status/:orderId", getPaymentStatus);

export default checkoutRouter;
