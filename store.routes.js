import express from "express";
import getProfileController from "./controllers/user/getProfile.controller.js";
import { checkAuth } from "./middlewares/checkAuth.js";
import authRouter from "./routes/auth.routes.js";
import cartRouter from "./routes/cart.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import productsRouter from "./routes/products.routes.js";
import userRouter from "./routes/users.routes.js";
import webhookRouter from "./routes/webHook.routes.js";

const profileRoute = express.Router();
profileRoute.get("/my-profile", checkAuth, getProfileController);

export {
  authRouter,
  cartRouter,
  checkoutRouter,
  orderRoutes,
  productsRouter,
  profileRoute,
  userRouter,
  webhookRouter
};
