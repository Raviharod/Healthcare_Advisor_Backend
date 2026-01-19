const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const {uploadToMemory} = require("../config/multerConfig");
const requireAuth = require("../middlewares/requireAuth");

userRouter.post("/signup",uploadToMemory.single("photo"), userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/userLogout", userController.userLogout);
userRouter.get("/consultation",requireAuth, userController.consultation)
userRouter.get("/userLoginInfo", userController.userLoginInfo);
userRouter.post("/addProduct",uploadToMemory.single("file"), userController.addProduct);
userRouter.get("/getproducts", userController.getproducts);
userRouter.post("/addToCart", requireAuth, userController.addToCart)
userRouter.get("/getcartDetails", requireAuth, userController.getCartDetails)
userRouter.post("/increaseProductQuantity", requireAuth, userController.increaseProductQuantity)
userRouter.post("/decreaseProductQuantity", requireAuth, userController.decreaseProductQuantity)
userRouter.post("/removeFromCart", requireAuth, userController.removeFromCart)

module.exports = userRouter;
