import Order from "../../models/orders.js";
import stripe from "../../utils/stripe.config.js";

export const createStripeCustomer = async (user, order) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
        orderId: order._id.toString(),
      },
    });
    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error("Failed to create Stripe customer");
  }
};

export const createPaymentIntent = async (order, customerId = null) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "usd",
      customer: customerId,
      metadata: {
        orderId: order._id.toString(),
        userId: order.userId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Order #${order._id.toString().slice(-8)}`,
      shipping: order.shippingAddress
        ? {
            name: `${order.userId.firstName} ${order.userId.lastName}`,
            address: {
              line1: order.shippingAddress.street,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              postal_code: order.shippingAddress.zipCode,
              country: order.shippingAddress.country,
            },
          }
        : undefined,
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
};

export const createCheckoutSession = async (order, user) => {
  try {
    const lineItems = order.items.map((item) => {
      let thumbnailUrl = item.thumbnail;
      if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
        thumbnailUrl = `${process.env.BACKEND_URL}/${thumbnailUrl}`;
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: thumbnailUrl ? [thumbnailUrl] : [],
            metadata: {
              productId: item.productId.toString(),
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Your Product Name",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.json({
      status: paymentIntent.status,
      paymentIntent: paymentIntent,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let paymentStatus = order.paymentStatus;

    if (order.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId
      );
      paymentStatus =
        paymentIntent.status === "succeeded" ? "paid" : paymentIntent.status;
    }

    return res.json({
      orderId,
      paymentStatus,
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeSessionId: order.stripeSessionId,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    return res.status(400).json({ error: error.message });
  }
};
