import express from "express";
import addToCartController from "../controllers/cart/addToCart.controller.js";
import clearCartController from "../controllers/cart/clearCart.controller.js";
import getCartController from "../controllers/cart/getCart.controller.js";
import removeFromCartController from "../controllers/cart/removeItemFromCart.controller.js";
import updateCartItemController from "../controllers/cart/updateCartQuantity.controller.js";
import { checkAuth, checkIsAuthorized } from "../middlewares/checkAuth.js";
import checkValidation from "../middlewares/checkValidation.js";
import {
    addToCartJoiSchema,
    updateCartItemJoiSchema,
} from "../validation/cartSchema.js";

const cartRouter = express.Router();

cartRouter.use(checkAuth, checkIsAuthorized(["user"]));

cartRouter
  .get("/", getCartController)
  .post("/add", checkValidation(addToCartJoiSchema), addToCartController)
  .patch(
    "/update",
    checkValidation(updateCartItemJoiSchema),
    updateCartItemController
  )
  .delete("/remove/:productId", removeFromCartController)
  .delete("/clear", clearCartController);

export default cartRouter;
