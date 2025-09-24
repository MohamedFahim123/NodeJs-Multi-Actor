import express from "express";
import createUserController from "../controllers/user/createUser.controller.js";
import deleteUserController from "../controllers/user/deleteUser.controller.js";
import editUserController from "../controllers/user/editUser.controller.js";
import showUsersController from "../controllers/user/showAllUsers.controller.js";
import showUserController from "../controllers/user/showUser.controller.js";
import { checkAuth, checkIsAuthorized } from "../middlewares/checkAuth.js";
import checkValidation from "../middlewares/checkValidation.js";
import uploadFile from "../middlewares/uploadfile.js";
import {
  createUserJoiSchema,
  updatUserJoiSchema,
} from "../validation/userSchema.js";

const userRouter = express.Router();

userRouter.use(checkAuth, checkIsAuthorized(["admin"]));

userRouter
  .get("/", showUsersController)
  .post(
    "/add-user",
    uploadFile.single("image"),
    checkValidation(createUserJoiSchema),
    createUserController
  )
  .patch(
    "/:id",
    uploadFile.single("image"),
    checkValidation(updatUserJoiSchema),
    editUserController
  )
  .delete("/:id", deleteUserController)
  .get("/:id", showUserController);

export default userRouter;
