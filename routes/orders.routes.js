import express from "express";
import getAllOrders from "../controllers/order/allOrders.controller.js";
import cancelOrder from "../controllers/order/cancelOrder.controller.js";
import createOrder from "../controllers/order/createOrder.controller.js";
import getOrderStats from "../controllers/order/getOrderStatus.controller.js";
import getMyOrders from "../controllers/order/myOrders.controller.js";
import getOrderById from "../controllers/order/orderDetails.controller.js";
import getSellerOrderStats from "../controllers/order/sellerOrderStatus.controller.js";
import updateOrderStatus from "../controllers/order/updateOrderStatus.controller.js";
import { checkAuth, checkIsAuthorized } from "../middlewares/checkAuth.js";

const orderRoutes = express.Router();

orderRoutes.use(checkAuth);

orderRoutes.get("/stats", checkIsAuthorized(["admin"]), getOrderStats);
orderRoutes.get("/", checkIsAuthorized(["admin"]), getAllOrders);
orderRoutes.post("/", checkIsAuthorized(["user"]), createOrder);
orderRoutes.get(
  "/my-orders",
  checkIsAuthorized(["user", "seller"]),
  getMyOrders
);
orderRoutes.get(
  "/seller-stats",
  checkIsAuthorized(["seller"]),
  getSellerOrderStats
);
orderRoutes.get("/:id", getOrderById);
orderRoutes.patch(
  "/:id/cancel",
  cancelOrder
);

orderRoutes.patch(
  "/:id/status",
  checkIsAuthorized(["admin", "seller"]),
  updateOrderStatus
);

export default orderRoutes;
