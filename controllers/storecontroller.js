const User = require('./../models/user')
const Home = require('./../models/home')
const path = require('path')
const rootdirectory = require("../util/pathutil.js")
const sendgrid = require('@sendgrid/mail');
const SEND_GRID_KEY =  process.env.SENDGRID_API_KEY 
sendgrid.setApiKey(SEND_GRID_KEY);

exports.gethomes = (req,res,next)=>{
    Home.find().then((registeredhomes) =>{
    
        res.render('store/homes',{
            homes:registeredhomes, 
            pagetitle:'Hamara Airbnb',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user})
    });
   
    
} 

exports.getindex = (req,res,next)=>{
    console.log(req.session);
    Home.find().then((registeredhomes) =>{
    
        res.render('store/index',{
            homes:registeredhomes, 
            pagetitle:'Hamara Airbnb',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user})
    });
}

exports.gethomedetails = (req,res,next)=>{
   
    const homeid = req.params.homeid;
    Home.findById(homeid).then((home) => {
       
        if(!home){
         console.log("Home not found");
         return res.redirect("/homes");
        }
        res.render('store/homedetails',{
            home:home ,
            pagetitle:'Home Details',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user})
        
    })
    
}

exports.postfavourite = async (req,res,next)=>{
    const homeid = req.body.id;
    const userid = req.session.user._id;

    try {
        const user = await User.findOne({_id:userid});

        if(!user.favouritehomes.includes(homeid)){
            user.favouritehomes.push(homeid);
            await user.save();
            
        }
    }

    catch(err) {
        console.log(err)
    }

    finally {
        res.redirect('/favourites') 
    }


}
      
 

exports.getfavourite = async (req,res,next)=>{
    const userid = req.session.user._id;
    try{
       const user =  await User.findById(userid).populate("favouritehomes");
        res.render('store/favourites',{
            homes: user.favouritehomes, 
            pagetitle:'favourites',
            isLoggedIn: req.session.isLoggedIn,
            user: req.session.user
        })
    }
    catch(err){
        console.log(err)
        res.redirect("/")
    }
     
}



exports.postdeletefavourite = (req,res,next)=>{
    const homeid = req.params.homeid;
    const userid = req.session.user._id;
    
    User.findById(userid)
    .then(user=>{
        user.favouritehomes= user.favouritehomes.filter(id=>id.toString()!==homeid);
        return user.save();
    })
    .then(()=>res.redirect("/favourites"))
    .catch((err)=>{
       
        console.log("Error occured while deleting from favourite " , err)
        res.redirect("/favourites")
       
        
    })
    
    

}

exports.getrules=(req,res,next)=>{
    if(!req.session.isLoggedIn){
        return res.redirect("/login")
    }
    const homeid = req.params.homeid;
    console.log(homeid);

    const rulesfilename =  `House Rules.pdf`;

    const filepath = path.join(rootdirectory,"rules",rulesfilename)
    console.log(filepath)
    // res.sendFile(filepath);
    res.download(filepath,rulesfilename.pdf)
}


exports.postsendEmail = async (req, res, next) => {
    try {
        const { hostid, userEmail, homeName, phonenumber, firstname, lastname} = req.body;
        console.log("hostid:", hostid, "User email:", userEmail, "house name:", homeName);
        console.log("homeid ", req.params.homeid)
        const host = await User.findById(hostid);
        if (!host) {
            throw new Error('Host not found');
        }

        const emailData = {
            to: host.email,
            from: {
            name: 'GOSTAY',
            email: process.env.FROM_EMAIL
            },
            subject: `New Inquiry for ${homeName}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #484848;">New Booking Inquiry</h2>
            <p>Dear Property Owner,</p>
            <p>We are writing to inform you that a potential guest is interested in your property "${homeName}".</p>
            <div style="background: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #008489;">Guest Details:</h3>
                <p><strong>Name:</strong> ${firstname} ${lastname}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Phone:</strong> ${phonenumber}</p>
            </div>
            <p>Please contact the guest directly to discuss the booking details.</p>
            <p>Best regards,<br>The GOSTAY Team</p>
            <p style="color: #717171; font-size: 12px; margin-top: 20px;">
                This is an automated message. Please do not reply to this email.
            </p>
            </div>
            `
        };
        
        await sendgrid.send(emailData);
        
        req.flash('success', 'Email sent to host successfully!');
        res.redirect(`/homes/${req.params.homeid}`);
    

    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'Failed to send email');
        res.redirect(`/homes/${req.params.homeid}`);
    }
};