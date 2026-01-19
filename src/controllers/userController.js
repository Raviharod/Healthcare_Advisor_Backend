const Patient = require("../models/patient");
const bcrypt = require("bcryptjs");
const imagekit = require("../config/imagekitConfig");
const Doctor = require("../models/doctor");
const Product = require("../models/product");
const Cart = require("../models/cart");
const { model } = require("mongoose");


exports.signup = async (req, res) => {
  console.log("reached to the signup controller");
  let photoUrl = "";

  const { userType } = req.body;
  if (userType == "patient") {
    const { username, email, password } = req.body;
    const user = await Patient.findOne({ email: email });
    if (user) {
      return res
        .status(400)
        .json({ message: "Patient already exists, Go to the Login page" });
    }
    bcrypt.hash(password, 10, async function (err, hashedPassword) {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }

      try {
        if (!req.file)
          return res.status(400).json({ error: "No file uploaded" });

        // convert buffer to base64 string
        const base64 = req.file.buffer.toString("base64");

        // optional: create unique filename or use req.file.originalname
        const fileName = `${Date.now()}_${req.file.originalname}`;

        const uploadResult = await imagekit.upload({
          file: base64, // required, base64 string
          fileName,
          folder: "/healthcareProfiles", // optional: set folder in ImageKit
          useUniqueFileName: true, // optional
        });
        console.log(uploadResult);
        photoUrl = uploadResult.url;
        // uploadResult.url is usually present; you may want uploadResult.thumbnail or other fields
        // return res.json({
        //   success: true,
        //   url: uploadResult.url,
        //   imagekit_response: uploadResult, // optional, remove if you want only url
        // });
      } catch (err) {
        console.error("Upload error:", err);
        return res
          .status(500)
          .json({ error: "Upload failed", details: err.message || err });
      }

      const newPatient = new Patient({
        name: username,
        email,
        photoUrl,
        password: hashedPassword,
      });

      await newPatient.save();
      return res.status(201).json({ message: "success" });
    });
  }

  if (userType == "doctor") {
    const {
      username,
      email,
      contact,
      consultationFees,
      specialization,
      experience,
      location,
      password,
    } = req.body;
    const doctor = await Doctor.findOne({ email: email });
    if (doctor) {
      return res
        .status(400)
        .json({ message: "doctor already exist! please login" });
    }

    bcrypt.hash(password, 10, async function (err, hashedPassword) {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }


      try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // convert buffer to base64 string
        const base64 = req.file.buffer.toString("base64");

        // optional: create unique filename or use req.file.originalname
        const fileName = `${Date.now()}_${req.file.originalname}`;

        const uploadResult = await imagekit.upload({
          file: base64, // required, base64 string
          fileName,
          folder: "/healthcareProfiles", // optional: set folder in ImageKit
          useUniqueFileName: true, // optional
        });
        console.log(uploadResult);
        photoUrl = uploadResult.url;
        // uploadResult.url is usually present; you may want uploadResult.thumbnail or other fields
        // return res.json({
        //   success: true,
        //   url: uploadResult.url,
        //   imagekit_response: uploadResult, // optional, remove if you want only url
        // });
      } catch (err) {
        console.error("Upload error:", err);
        return res
          .status(500)
          .json({ error: "Upload failed", details: err.message || err });
      }
      const newDoctor = new Doctor({
        name: username,
        email,
        specialization,
        contact,
        consultationFees,
        experience,
        location,
        imgUrl: photoUrl,
        password: hashedPassword,
      });
      await newDoctor.save();
      return res.status(201).json({ message: "success" });
    })
  }
  // // console.log(user)
};

exports.login = async (req, res) => {
  let role = "patient";
  const { email, password } = req.body;
  let user = await Patient.findOne({ email: email });
  if (!user) {
    role = "doctor";
    user = await Doctor.findOne({ email: email });
  }
  if (!user) {
    return res
      .status(400)
      .json({ message: "user not exist, Please signup" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ message: "Error generating session" });
    }
    req.session.user = { id: user._id, email: user.email, name: user.name, role: role };
    req.session.save(() => {
      return res.status(200).json({ message: "Login successful" });
    });
  });
};


exports.consultation = async (req, res) => {
  const doctors = await Doctor.find();
  // console.log(doctors);
  if (doctors) {
    // console.log(doctors)
    const modifiedDoctors = doctors.map(doctor => {
      const onlineUserData = global.onlineUsers.get(doctor._id.toString());
      return {
        ...doctor,
        socketId: onlineUserData ? onlineUserData.socketId : null,
        isOnline: global.onlineUsers.has(doctor._id.toString()),
      };
    })
    // console.log("onlineusers", global.onlineUsers)
    // console.log(modifiedDoctors);
    return res.status(201).json({ doctors: modifiedDoctors });
  }
  return res.status(401).json({ message: "No doctors available" });
}

exports.userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    // Clear the cookie too
    res.clearCookie("connect.sid"); // or your session cookie name
    return res.status(200).json({ message: "Logged out successfully" });
  });
}

exports.userLoginInfo = async (req, res) => {


  const userDetails = req.session.user;
  // console.log(userDetails);
  if (req.session && req.session.user) {
    return res.status(200).json({ user: userDetails });
  }
  return res.status(400).json({ message: "User Not Found" })
};


exports.addProduct = async (req, res) => {
  // console.log("reached to the add product")
  const { name, description, price, catogory } = req.body;
  // console.log(req.body);
  let photoUrl = "";
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // convert buffer to base64 string
    const base64 = req.file.buffer.toString("base64");

    // optional: create unique filename or use req.file.originalname
    const fileName = `${Date.now()}_${req.file.originalname}`;

    const uploadResult = await imagekit.upload({
      file: base64, // required, base64 string
      fileName,
      folder: "/productImages", // optional: set folder in ImageKit
      useUniqueFileName: true, // optional
    });
    console.log(uploadResult);
    photoUrl = uploadResult.url;
    // uploadResult.url is usually present; you may want uploadResult.thumbnail or other fields
    // return res.json({
    //   success: true,
    //   url: uploadResult.url,
    //   imagekit_response: uploadResult, // optional, remove if you want only url
    // });
  } catch (err) {
    console.error("Upload error:", err);
    return res
      .status(500)
      .json({ error: "Upload failed", details: err.message || err });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      image: photoUrl,
      catogory,
      price
    });

    await newProduct.save();
    res.status(200).json({ message: "product added successfully" });
  } catch (err) {
    // console.log(err)
    res.status(400).json({ message: "Their is an error adding product" });
  }
}

exports.getproducts = async (req, res) => {
  try {
    const products = await Product.find();
    // console.log(products)
    res.status(200).json({ products })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'error getting products' })
  }
};

exports.addToCart = async (req, res) => {
  // console.log("reached to the add to cart");
  const userId = req.session.user.id;
  const { productId } = req.body;
  const defaultQuantity = 1;
  // console.log(userId, productId);

  const cart = await Cart.findOne({ userId });
  // console.log(cart)
  try {
    if (!cart) {
      const newCartItem = new Cart({
        userId,
        items: [{ productId, quantity: 1 }]
      })
      await newCartItem.save();
      return res.status(200).json({ message: "successful", cartProductQuanity: 1 });
    }
    else {
      const existingProductIndex = cart.items.findIndex((item) => item.productId == productId);
      //  console.log("existingProduct", existingProductIndex)
      if (existingProductIndex > -1) {
        cart.items[existingProductIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: defaultQuantity });
      }
    }
    await cart.save();
    return res.status(200).json({ message: "successful", cartProductQuanity: cart.items.length });
  }
  catch (err) {
    console.log("err cert", err)
    return res.status(400).json({ message: "error adding product in cart" });
  }
};

exports.getCartDetails = async (req, res) => {
  // console.log("reached to the get cart details")
  const userId = req.session.user.id;
  // console.log(userId)
  const cartDetails = await Cart.findOne({ userId: userId })
    .populate({
      path: 'items.productId', // Path to the field inside the array
      model: 'Product',
    });

  // console.log(cartDetails)
  if (!cartDetails) {
    return res.status(400).json({ message: "your cart is empty!" });
  } else {
    return res.status(200).json({ message: "successfull", cartDetails: cartDetails.items });
  }
}

exports.increaseProductQuantity = async (req, res) => {
  const userId = req.session.user.id;
  const { productId } = req.body;
  // console.log(userId, productId);

  const cart = await Cart.findOne({ userId });
  // console.log("cart", cart);
  if (!cart) {
    return res.status(400).json({ message: "no cart items are found" });
  } else {
    const existingProductIndex = cart.items.findIndex((item) => item.productId == productId);
    cart.items[existingProductIndex].quantity += 1;
  }
  await cart.save();
  return res.status(200).json({ message: "successfull" });
}

exports.decreaseProductQuantity = async (req, res) => {
  const userId = req.session.user.id;
  const { productId } = req.body;
  // console.log(userId, productId);

  const cart = await Cart.findOne({ userId });
  // console.log("cart", cart);
  if (!cart) {
    return res.status(400).json({ message: "no cart items are found" });
  } else {
    const existingProductIndex = cart.items.findIndex((item) => item.productId == productId);
    cart.items[existingProductIndex].quantity -= 1;
  }
  await cart.save();
  return res.status(200).json({ message: "successfull" });
}

exports.removeFromCart = async (req, res) => {
  const userId = req.session.user.id;
  const { productId } = req.body;
  // console.log(userId, productId);

  await Cart.updateOne(
    { userId: userId },
    { $pull: { items: { _id:productId } } }
);
  return res.status(200).json({ message: "successfull" });
}