
const { deletefile } = require('../util/file');
const Home = require('./../models/home');
const rootdirectory = require('../util/pathutil');
const path = require("path")

exports.getaddhome = (req,res,next)=>{
    
    res.render("host/edit-home",{
        editing :false , 
        pagetitle:'Add Your Home',
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user})
}

exports.postaddhome = (req,res,next)=>{
    console.log("Host controller",req.body);
    const {housename,price,rating,location,features,description} = req.body;
    // console.log("Request body",req.body)
    console.log("House photo",req.file)

    if(!req.file){
        return res.status(400).send(' No valid image provided  ')
    }
   console.log(" req.file.path",req.file.path) 
   const photourl = "/" + path.relative(rootdirectory, req.file.path).replace(/\\/g, '/'); // Trim the path and replace backslashes with forward slashes
   console.log('photourl', photourl);
    
    const newhome = new Home({
        housename,
        price,
        rating,
        location,
        photourl,
        features,
        description,
        host: req.session.user._id
    });
    
    newhome.save().then(()=>{
        res.redirect("/host/hosthome")
    }).catch(err=>{
        console.log("Error while saving home",err);
        res.redirect("/")
    });
    
    };




exports.gethosthome = (req,res,next)=>{
        Home.find({host: req.session.user._id}).then ((registeredhomes) =>{
        
            res.render('host/hosthome',{
                homes:registeredhomes, 
                pagetitle:'Host Home',
                isLoggedIn: req.session.isLoggedIn,
                user: req.session.user})
        });
       
        
    } 

exports.getedithome = (req,res,next)=>{
        const homeid = req.params.homeid;
        const editing = req.query.editing ==="true";
        if(!editing){
            console.log("EDiting flag not set properly")
            return res.redirect("/hosthome")
        }

        Home.findById(homeid).then((home) =>{
        
            if(!home){
                console.log("Home not found for editing")
                return res.redirect("/hosthome");
            }
            res.render('host/edit-home',{
                home: home , 
                editing : editing, 
                pagetitle:'Edit Your Home',
                isLoggedIn: req.session.isLoggedIn,
                user: req.session.user})
        }).catch(err=>{console.log("Error while fetching home for editing ",err)})
       
    }    

exports.postedithome = (req,res,next)=>{
    const {id,housename,price,rating,location,photourl,features,description} = req.body;
    //bussines logic ouside the model, not a good practice


    Home.findById(id).then(existinghome=>{
        if(!existinghome){
            console.log("Home not found for editing");
           return   res.redirect('/host/hosthome')
        }
        existinghome.housename=housename;
        existinghome.price=price;
        existinghome.rating=rating;
        existinghome.location=location;
        if(req.file){ 
          deletefile(existinghome.photourl.substring(1));
          existinghome.photourl="/" + path.relative(rootdirectory, req.file.path).replace(/\\/g, '/'); // Trim the path and replace backslashes with forward slashes

          
        }
        existinghome.features=features;
        existinghome.description=description;
        return existinghome.save();

 
    }).finally(()=>  res.redirect('/host/hosthome'))

  
        
  
}    

exports.postdeletehome = (req,res,next)=>{
    const homeid = req.params.homeid;
    
    Home.findById(homeid).then(existinghome=>{
        try{
            deletefile(existinghome.photourl.substring(1));
        }
        catch(err){
           console.log(err)
        }
    
    })

    Home.findByIdAndDelete(homeid).then(()=>{
        console.log("Came to delete homeid ", homeid )
        res.redirect('/host/hosthome') 
    })





    
}   

exports.postToggleStatus = async (req, res, next) => {
    console.log("Toggle status")
    try {
        const homeId = req.params.homeid;
        const newStatus = req.body.status;
        
        await Home.findByIdAndUpdate(homeId, {
            status: newStatus
        });
        
       
        res.redirect('/host/hosthome');
    } catch (error) {
        console.error(error);
       
        res.redirect('/host/hosthome');
    }
};
