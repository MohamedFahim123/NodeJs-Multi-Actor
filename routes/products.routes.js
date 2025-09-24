import express from "express";
import addProductController from "../controllers/product/addProduct.controller.js";
import showAllProductsController from "../controllers/product/allProducts.controller.js";
import { checkAuth, checkIsAuthorized } from "../middlewares/checkAuth.js";
import checkValidation from "../middlewares/checkValidation.js";
import { uploadProductFiles } from "../middlewares/uploadfile.js";
import {
  addNewProductSchema,
  updateProductSchema,
} from "../validation/productSchema.js";
import getSingleProductController from "../controllers/product/singleProduct.controller.js";
import deleteProductController from "../controllers/product/deleteProduct.controller.js";
import updateProductController from "../controllers/product/updateProduct.controller.js";

const productsRouter = express.Router();

productsRouter
  .get("/", showAllProductsController)
  .get("/:id", getSingleProductController)
  .delete(
    "/:id",
    checkAuth,
    checkIsAuthorized(["admin", "seller"]),
    deleteProductController
  )
  .post(
    "/:id",
    checkAuth,
    checkIsAuthorized(["admin", "seller"]),
    uploadProductFiles,
    checkValidation(updateProductSchema),
    updateProductController
  )
  .post(
    "/add-product",
    checkAuth,
    checkIsAuthorized(["seller"]),
    uploadProductFiles,
    checkValidation(addNewProductSchema),
    addProductController
  );

export default productsRouter;
