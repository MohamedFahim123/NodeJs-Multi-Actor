import Cart from "../../models/cart.js";
import Order from "../../models/orders.js";
import Product from "../../models/products.js";
import stripe from "../../utils/stripe.config.js";

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      default:
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

const handleCheckoutSessionCompleted = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    throw new Error("No order ID in session metadata");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  order.paymentStatus = "paid";
  order.stripePaymentIntentId = session.payment_intent;
  order.paymentDetails = {
    amount: session.amount_total / 100,
    currency: session.currency,
    payment_method: "card",
    receipt_url: session.charges?.data[0]?.receipt_url,
  };

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  await Cart.findOneAndUpdate(
    { userId: order.userId },
    { items: [], total: 0 }
  );

  await order.save();
};

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const order = await Order.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (!order) {
    return;
  }

  order.paymentStatus = "paid";
  order.paymentDetails = {
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    payment_method: paymentIntent.payment_method_types[0],
    last4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
    brand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
    receipt_url: paymentIntent.charges.data[0]?.receipt_url,
  };

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  await Cart.findOneAndUpdate(
    { userId: order.userId },
    { items: [], total: 0 }
  );

  await order.save();
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  const order = await Order.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });
  if (order) {
    order.paymentStatus = "failed";
    await order.save();
  }
};

const handleChargeRefunded = async (charge) => {
  const order = await Order.findOne({
    stripePaymentIntentId: charge.payment_intent,
  });
  if (order) {
    order.paymentStatus = "refunded";

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
  }
};

export default stripeWebhook;
