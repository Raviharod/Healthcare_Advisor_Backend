const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image:{
        type:String,
        required:true
    },
    catogory: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    stock: Number
})

module.exports = mongoose.model("Product", productSchema);