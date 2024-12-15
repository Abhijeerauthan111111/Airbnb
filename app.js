const ENV = process.env.NODE_ENV || "development";

require("dotenv").config(
    {
        path : `.env.${ENV}`
    }
);

// //core module
const path = require('path');   //path manipulation
const fs = require('fs');    // file system operations


//importing external module
const express = require('express');
const bodyparser = require('body-parser');  
const mongoose = require("mongoose"); //mongodb ORM
const session = require('express-session');   //session management
const MongoDbSession = require("connect-mongodb-session"); //store sessions in mongodb
const multer = require("multer")   //handle file uploads
const helmet = require("helmet")    //security header
const compression = require("compression")
const morgan = require("morgan")    //HTTP req logger

// importing local module

const storeRouter = require('./routers/storeRouter');
const {hostrouter} = require('./routers/hostRouter');
const {authrouter} = require('./routers/authrouter');
const rootdirectory = require('./util/pathutil');
const errorcontroller = require('./controllers/errorcontroller');


//mongodb session store setup
const mongodbstore = MongoDbSession(session);
const MONGO_DB_URL = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@airbnb.wtoi7.mongodb.net/${process.env.MONGO_DB_DATABASE}`;
const sessionstore = new mongodbstore({
    uri : MONGO_DB_URL,
    collection: "sessions"
})


//Multer config for file uploads and customized file name

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(rootdirectory,"uploads/"))
    },


    filename: (req,file,cb)=>{
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    },

} )


//filefilter for uploading images 

const filefilter = (req,file,cb)=>{
   const isvalidfile = ['image/png','image/jpeg','image/jpg'].includes(file.mimetype);
   console.log(isvalidfile)
   cb(null, isvalidfile);
}

//setupp of HTTP req logging
const logginstream = fs.createWriteStream(path.join(rootdirectory, 'access.log'), { flags: 'a' });




//setting up express app config
const app = express();


// app.use(
//     helmet({
//         contentSecurityPolicy: {
//             directives: {
//                 ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//                 "script-src": ["'self'", "'unsafe-inline'"],
//             },
//         },
//     })
// );
app.use(helmet());  //add security headers
app.use(compression());   //compress all response
app.use(morgan('combined',{stream : logginstream }))   //log http req

//view engine setup
app.set('view engine','ejs');   //ejs as template engine
app.set('views','views');     //views directory


//serving static files
app.use(express.static(path.join(rootdirectory,"public")));   //serve static files
app.use('/uploads',express.static(path.join(rootdirectory,"uploads")));  //serve upload files


//Make path available 
app.use((req, res, next) => {
    res.locals.path = req.path;  // Makes current path path available in all views
    next();
});


//using body parser in middlware

app.use(bodyparser.urlencoded({extended:true}));

app.use(multer({storage,fileFilter:filefilter}).single("photo"));

//using routers


//session config
app.use(session({
    secret :'airbnb',   
    resave : false,
    saveUninitialized : true,
    store : sessionstore, 
}))

//route handler
app.use(storeRouter);

//if not logged in  it stays in login page
app.use("/host",(req,res,next)=>{
if(!req.session.isLoggedIn){
    return res.redirect("/login")
}
next();
})

app.use(hostrouter);

app.use(authrouter);

app.use(errorcontroller.get404);





 
// setting up port
const port = process.env.PORT || 3001;
mongoose.connect(MONGO_DB_URL).then(()=>{
    console.log("Connected to mongo db")
    app.listen(port ,()=>{ console.log(`Server running at : http://localhost:${port}`)});

    } ).catch(err=>{
        console.log("Error while connecting to MONGODB ",err)
    }); 
  