const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const {uploadToMemory} = require("../config/multerConfig");
const requireAuth = require("../middlewares/requireAuth");

userRouter.post("/signup",uploadToMemory.single("photo"), userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/userLogout", userController.userLogout);
userRouter.get("/consultation",requireAuth, userController.consultation)
userRouter.get("/userLoginInfo", userController.userLoginInfo)

module.exports = userRouter;
