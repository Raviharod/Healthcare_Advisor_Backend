const mongoose = require("mongoose");


const doctorSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
  },
  specialization:{
    type:String,
    trim:true
  },
  contact:{
    type:Number,
  },
  consultationFees:{
    type:Number,
    default:0
  },
  experience:{
    type:Number,
    default:0
  },
  location:{
    type:String
  },
  imgUrl:{
    type:String
  },
  password:{
    type:String,
    required:true
  }
})


module.exports = mongoose.model("Doctor", doctorSchema);