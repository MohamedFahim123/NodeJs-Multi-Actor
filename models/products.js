import mongoose from "mongoose";
import { availableCategories } from "../utils/variables.js";

const productSchema = mongoose.Schema(
  {
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    images: {
      type: [String],
      required: [true, "Images are required"],
      validate: {
        validator: function (images) {
          return images.length >= 1 && images.length <= 5;
        },
        message: "Products must have between 1 and 5 images",
      },
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [3, "Title must be at least 3 characters"],
      maxLength: [20, "Title must be at most 20 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [3, "Description must be at least 3 characters"],
      maxLength: [100, "Description must be at most 100 characters"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be at least 0"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Price must be a positive number",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock must be at least 0"],
      validate: {
        validator: function (value) {
          return value >= 0 && Number.isInteger(value);
        },
        message: "Stock must be a positive integer",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: availableCategories,
        message:
          "Category must be one of: laptops, phones, tablets, accessories, headphones, smartwatch, cameras, monitors, computers",
      },
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid seller ID",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

const ProductsMongooseSchema = mongoose.model("Product", productSchema);

export default ProductsMongooseSchema;
