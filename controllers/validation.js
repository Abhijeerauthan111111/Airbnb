const {check, validationResult} = require("express-validator");


//first name validator
exports. firstnamevalidator = 
check('firstname')
   .notEmpty()
   .withMessage("first name is mandatory")
   .trim()
   .isLength({min:2})
   .withMessage("First name should be minimum two chars")
   .matches(/^[a-zA-Z/s]+$/)
   .withMessage("First name should only containe English alphabets");

 //last name validator
exports. lastnamevalidator = 
check('lastname')
   .notEmpty()
   .withMessage("Last name is mandatory")
   .trim()
   .isLength({min:2})
   .withMessage("Last name should be minimum two chars")
   .matches(/^[a-zA-Z/s]+$/)
   .withMessage("Last name should only containe English alphabets");  

 //Email validator
 exports. emailvalidator = 
 check('email')
    .isEmail()
    .withMessage("Please Enter a valid email")
    .normalizeEmail({
      gmail_remove_dots: false
    });
    
//password validator

exports. passwordvalidator = 
 check('password')
    .isLength({min:8})
    .withMessage("Password must be at least 8 char long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain atleast one special character ! @ # $ %...")
    .trim();

//confirmpassword validator

exports. confirmpasswordvalidator = 
 check('confirmpassword')
    .trim()
    .custom((value, {req})=>{
        if(value !== req.body.password){
          throw new Error("Password do not match");
          
        }
        return true;
      });    


// userType validator

exports. userTypevalidator = 
check('userType')
.notEmpty()
.withMessage("User type cannot be empty")
.isIn(['guest', 'host'])
.withMessage("Invalid user type")


// terms validator

exports. termvalidator =
check("terms")
.notEmpty()
.withMessage("Terms and condition must be accepted ")