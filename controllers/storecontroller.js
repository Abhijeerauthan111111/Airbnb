const User = require('./../models/user')
const Home = require('./../models/home')
const path = require('path')
const rootdirectory = require("../util/pathutil.js")

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