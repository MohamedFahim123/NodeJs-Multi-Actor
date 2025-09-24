import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  title: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "debit_card", "stripe", "cash_on_delivery"],
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true, 
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    paymentDetails: {
      amount: Number,
      currency: String,
      payment_method: String,
      last4: String,
      brand: String,
      receipt_url: String,
    },
    sellers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.virtual("orderSummary").get(function () {
  return {
    orderId: this._id,
    totalPrice: this.totalPrice,
    totalItems: this.totalQuantity,
    status: this.status,
  };
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
