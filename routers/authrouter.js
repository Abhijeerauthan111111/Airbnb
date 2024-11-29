const express = require("express")
const authrouter = express.Router();
const authcontroller = require('./../controllers/authcontroller')


authrouter.get("/login", authcontroller.getlogin)
authrouter.post("/login", authcontroller.postlogin)
authrouter.post("/logout", authcontroller.postlogout)
authrouter.get("/signup", authcontroller.getsignup)
authrouter.post("/signup", authcontroller.postsignup)
authrouter.get("/forgotpassword", authcontroller.getforgotpassword)
authrouter.post("/forgotpassword", authcontroller.postforgotpassword)
authrouter.get("/resetpassword", authcontroller.getresetpassword)
authrouter.post("/resetpassword", authcontroller.postresetpassword)

exports.authrouter = authrouter;
 