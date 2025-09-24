import express from "express";
import stripe from "../utils/stripe.config.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update order as paid
      await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { paymentStatus: "paid" }
      );
    }

    res.json({ received: true });
  }
);

export default webhookRouter;
