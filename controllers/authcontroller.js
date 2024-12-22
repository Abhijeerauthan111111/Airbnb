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
      const {email, otp, password} = req.body;
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

      //    const resetdoneemail = {
      //       to: email,
      //       from: process.env.FROM_EMAIL,
      //       subject: "Password Reset Successful - GOSTAY",
      //       html: `
      //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      //          <h2 style="color: #484848;">Password Reset Successful</h2>
      //          <p>Dear user,</p>
      //          <div style="background: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      //          <p style="color: #008489; font-size: 18px;">Your GOSTAY account password has been successfully reset.</p>
      //          <p>You can now login to your account with your new password.</p>
      //          </div>
      //          <p>If you did not request this change, please contact our support team immediately.</p>
      //          <p style="color: #717171; font-size: 12px; margin-top: 20px;">
      //          This is an automated message, please do not reply to this email.
      //          </p>
      //       </div>
      //       `
      //    }
      
      //  await sendgrid.send(resetdoneemail);

           
       return res.redirect("/login")

        

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
      const forgotemail = {
         to: email,
         // from: process.env.FROM_EMAIL,
         from: {
            name: 'GOSTAY',
            email: process.env.FROM_EMAIL

         },
         subject: "Password Reset Request - GOSTAY",
         html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #484848;">Password Reset Request</h2>
            <p>We received a request to reset your GOSTAY account password.</p>
            <div style="background: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong style="font-size: 24px; color: #008489;">${otp}</strong>
            <p style="margin: 10px 0 0;">This code is valid for 10 minutes only.</p>
            </div>
            <p>To complete the password reset process, please enter this code on the 
            <a href="https://gostay-backend.azurewebsites.net/resetpassword?email=${encodeURIComponent(email)}" 
               style="color: #008489; text-decoration: none;">reset password page</a>.
            </p>
            <p style="color: #717171; font-size: 12px; margin-top: 20px;">
            If you didn't request this password reset, please ignore this email.
            </p>
         </div>
         `
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

      const {firstname,lastname,email,password,userType,phonenumber} = req.body;
      
      try {
         const hashpassword = await  bcrypt.hash(password,12);
         const user = new User({firstname,lastname,email,password : hashpassword,userType, phonenumber})
         await user.save();

          const welcomeemail = {
            to: email,
            // from: process.env.FROM_EMAIL,
            from: {
               name: 'GOSTAY',
               email: process.env.FROM_EMAIL

            },
            subject: "Welcome to GOSTAY!",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #484848;">Welcome to GOSTAY!</h2>
               <p>Dear ${firstname} ${lastname},</p>
               <div style="background: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                 <p style="color: #008489; font-size: 18px;">Thank you for joining our community!</p>
                 <p>Get ready to explore amazing stays and create unforgettable memories with GOSTAY.</p>
               </div>
               <p>Start your journey by browsing our selection of unique accommodations.</p>
               <p style="color: #717171; font-size: 12px; margin-top: 20px;">
                 We're excited to have you as part of our GOSTAY family!
               </p>
            </div>
            `
          };

         await sendgrid.send(welcomeemail);

         return res.redirect("/login")

      }
      catch (err) {
         // Handle duplicate email error
         if (err.code === 11000) {
             return res.status(422).render('auth/signup', {
                 pagetitle: "Signup",
                 isLoggedIn: false,
                 path: req.path,
                 errormessages: ["Email address already exists"],
                 oldinput: req.body,
               }
            );
         }
         
         // Handle other errors
         return res.status(422).render('auth/signup', {
             pagetitle: "Signup",
             isLoggedIn: false,
             path: req.path,
             errormessages: [err.message],
             oldinput: req.body,
            }
         );
      }
   }
];
      



