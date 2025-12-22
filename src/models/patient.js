const mongoose = require('mongoose');


const patientSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
  },
  photoUrl:{
    type:String
  },
  password:{
    type:String,
    required:true,
  }
})

module.exports = mongoose.model('Patient', patientSchema);