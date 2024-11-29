const ENV = process.env.NODE_ENV || "production";

require("dotenv").config(
    {
        path : `.env.${ENV}`
    }
);

// //core module
const path = require('path');
const fs = require('fs');


//importing external module
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require("mongoose");
const session = require('express-session');
const MongoDbSession = require("connect-mongodb-session");
const multer = require("multer")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")


 
// importing local module

const storeRouter = require('./routers/storeRouter');
const {hostrouter} = require('./routers/hostRouter');
const {authrouter} = require('./routers/authrouter');
const rootdirectory = require('./util/pathutil');
const errorcontroller = require('./controllers/errorcontroller');


const mongodbstore = MongoDbSession(session);
const MONGO_DB_URL = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@airbnb.wtoi7.mongodb.net/${process.env.MONGO_DB_DATABASE}`;

const sessionstore = new mongodbstore({
    uri : MONGO_DB_URL,
    collection: "sessions"
})


//storage of uploaded images and customized file name

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


const logginstream = fs.createWriteStream(path.join(rootdirectory, 'access.log'), { flags: 'a' });


//routers


//setting up ejs
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
app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream : logginstream }))

app.set('view engine','ejs');
app.set('views','views');


//serving static files
app.use(express.static(path.join(rootdirectory,"public")));
app.use('/uploads' , express.static(path.join(rootdirectory,"uploads")));


//Make path available 
app.use((req, res, next) => {
    res.locals.path = req.path;  // Makes path available in all views
    next();
});


//using body parser in middlware
app.use(bodyparser.urlencoded({extended:true}));

app.use(multer({storage,fileFilter:filefilter}).single("photo"));




//using routers

app.use(session({
    secret :'airbnb',
    resave : false,
    saveUninitialized : true,
    store : sessionstore, 
}))


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



   