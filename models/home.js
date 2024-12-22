const mongoose = require("mongoose");


const homeschema = new mongoose.Schema({
  housename: {type:String, required: true}, 
  price : {type:Number, required: true},
   rating:{type:Number, required: true},
    location: {type:String, required: true},
    photourl: {type:String, },
    features: String,
    description: String,
    host : { type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available'
  }

});


  

module.exports = mongoose.model('Home',homeschema);



