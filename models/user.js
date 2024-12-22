const mongoose = require("mongoose");


const userschema = new mongoose.Schema({
  firstname: {type:String, required: true}, 
  lastname : {type:String, required: true},
  phonenumber : {type:String, required: true},
  email : {type:String, required: true, unique: true},
  password : {type:String, required: true},
  userType : {type:String, required: true, enum:["guest","host"]},
  favouritehomes :[{ type: mongoose.Schema.Types.ObjectId, ref: 'Home' }],
  showinfo : {type:Boolean, default: true},
  otp : String,
  otpexpiry : Date,              

  
});




module.exports = mongoose.model('User',userschema);
 