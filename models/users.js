import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { patterns } from "../utils/variables.js";

const usersMongooseSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minLength: [3, "First name must be at least 3 characters"],
      maxLength: [20, "First name must be at most 20 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minLength: [3, "Last name must be at least 3 characters"],
      maxLength: [20, "Last name must be at most 20 characters"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: [true, "Phone must be unique"],
      validate: {
        validator: function (phone) {
          return patterns.phone.test(phone);
        },
        message: "Phone number is not valid",
      },
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      validate: {
        validator: function (email) {
          return patterns.email.test(email);
        },
        message: "Email is not valid",
      },
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function (password) {
          return patterns.password.test(password);
        },
        message: "Password is not valid",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "seller", "user"],
        message: "Role must be either admin, seller, or user",
      },
      default: "user",
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

usersMongooseSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

usersMongooseSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    try {
      const salt = await bcryptjs.genSalt(12);
      update.password = await bcryptjs.hash(update.password, salt);
      this.setUpdate(update);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

usersMongooseSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

usersMongooseSchema.virtual("cart", {
  ref: "Cart",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

const userModel = mongoose.model("User", usersMongooseSchema);

export default userModel;
