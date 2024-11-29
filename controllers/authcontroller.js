const {check, validationResult} = require("express-validator");
const User = require("./../models/user");
const bcrypt = require("bcryptjs");
const sendgrid = require('@sendgrid/mail');
const { firstnamevalidator, lastnamevalidator, emailvalidator, passwordvalidator, confirmpasswordvalidator, userTypevalidator, termvalidator } = require("./validation");

const MILLI_IN_MIN = 60 * 1000; 
      
const SEND_GRID_KEY =  process.env.SENDGRID_API_KEY 
sendgrid.setApiKey(SEND_GRID_KEY);



exports.getlogin = (req,res,next)=>{
   res.render('auth/login', {
      pagetitle:"Login",
      isLoggedIn : false,
      path: req.path,
      })
}

exports.postlogin = async (req,res,next)=>{
   const {email,password}=req.body;
   console.log(email,password);


   try{
      const user = await User.findOne({email});
         if(!user){
            throw new Error("User Not Found");
            
         }

      const ismatch = await bcrypt.compare(password,user.password)
         if(!ismatch){
            throw new Error("Password Does Not Match");
         
         }  
       
      req.session.isLoggedIn = true; 
      req.session.user = user;  
      await req.session.save();

      res.redirect('/');
   }


   catch(err){
      res.render('auth/login', {
         pagetitle:"Login", 
         isLoggedIn : false,
         path: req.path,
         errormessages: [err.message]
      })
   }
    
} 



exports.postlogout = (req,res,next)=>{
     
   req.session.destroy();
      
      res.redirect('/login')
   }  

exports.getsignup=(req,res,next)=>{
    res.render('auth/signup',{pagetitle:"Signup", isLoggedIn:false,path: req.path})
}   

exports.getforgotpassword=(req,res,next)=>{
   res.render('auth/forgot', {
      pagetitle:"Forgot Password", 
      isLoggedIn : false,
      path: req.path,
   })
}

exports.getresetpassword= (req,res,next)=>{
   const {email} = req.query;
  
   res.render('auth/resetpassword', {
      pagetitle :"Reset Password", 
      isLoggedIn : false,
      path : req.path,
      email : email
   })
}



exports.postresetpassword = [ 

   passwordvalidator,
   confirmpasswordvalidator,


   async (req,res,next)=>{
      const {email, otp, password,confirmpassword} = req.body;
      console.log("Email:", email); // Debugging: Log the email value
 
      const errors = validationResult(req); 

      if(!errors.isEmpty()){
     
        return res.status(422).render('auth/resetpassword',{
           pagetitle:"Reset Password", 
           isLoggedIn:false,
           path: req.path,
           email: email,
           errormessages: errors.array().map(err=>err.msg),
          
        })
      }
  

      try {
      
           
         
         const user = await User.findOne({ email: email.trim() });
         console.log("User:", user); // Debugging: Log the user object

         if(!user){

            throw new Error("User Not Found");
            
         }

         else if(user.otpexpiry < Date.now()){
            throw new Error("Otp is expired");
         }

         else if(user.otp !== otp){
            throw new Error("Wrong Otp");
         }
         
         const hashpassword = await bcrypt.hash(password,12);
      
         user.password = hashpassword;
     
         user.otp = undefined;
         user.otpexpiry = undefined;
         await user.save();

           
         res.redirect("/login")



      } catch(err){

         res.render('auth/resetpassword', {
            pagetitle :"Reset Password", 
            isLoggedIn : false,
            path : req.path,
            email : email,
            errormessages : [err.message]
         })
      }
   
   }
];




exports.postforgotpassword=async (req,res,next)=>{
   const {email} = req.body;
 
   try {
      let user = await User.findOne({email});
      

      if(!user){
         throw new Error("No such user found");
   
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpexpiry = Date.now() + 10000 * MILLI_IN_MIN;
      await user.save();
      const forgotemail ={
         to: email,
         from: process.env.FROM_EMAIL,
         subject: "Password Recovery for Sasta Airbnb",
         html : `<h3>Here is your OTP ${otp}. valid For 5 mins only</h3>
         <h3> Enter This password in <a href="http://localhost:3001/resetpassword?email=${email}"> Reset Password </a> page </h3>`
      };

      await sendgrid.send(forgotemail);


      res.redirect(`/resetpassword?email= ${email}`)
   } 
   
   catch (err) {
      res.render('auth/forgot', {
         pagetitle:"Forgot Password", 
         isLoggedIn : false,
         errormessages: [err.message],
         path: req.path,
      })
   }
  
 

}






exports.postsignup = [
   firstnamevalidator,
   lastnamevalidator,
   emailvalidator,
   passwordvalidator,
   confirmpasswordvalidator,
   userTypevalidator,
   termvalidator,

   async (req,res,next)=>{
     
      console.log("User came for signup",req.body)
      const errors = validationResult(req); 

      if(!errors.isEmpty()){
      
         return res.status(422).render('auth/signup',{
            pagetitle:"Signup", 
            isLoggedIn:false,
            path: req.path,
            errormessages: errors.array().map(err=>err.msg),
            oldinput: req.body,
         })
      }

      const {firstname,lastname,email,password,userType} = req.body;
      
      try {
         const hashpassword = await  bcrypt.hash(password,12);
         const user = new User({firstname,lastname,email,password : hashpassword,userType})
         await user.save();

         const welcomeemail ={
            to: email,
            from: process.env.FROM_EMAIL,
            subject: "Welcome to Airbnb ki copy",
            html : `<h1>Welcome ${firstname} ${lastname}. Enjoy booking your first home with us</h1>`
         };

         await sendgrid.send(welcomeemail);

         return res.redirect("/login")

      }
      
      catch (err) {
      
         return res.status(422).render('auth/signup',{
            pagetitle:"Signup", 
            isLoggedIn:false,
            path: req.path,
            errormessages: [err.message],
            oldinput: req.body,
         })
      }

   }

];


