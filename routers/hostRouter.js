const express = require('express');
// const path = require('path');
const hostrouter = express.Router();
// const rootdirectory = require('../util/pathutil');
const hostcontroller = require('./../controllers/hostcontroller')

hostrouter.get("/host/add-home",hostcontroller.getaddhome);
hostrouter.post("/host/add-home",hostcontroller.postaddhome);
hostrouter.get('/host/hosthome',hostcontroller.gethosthome);
hostrouter.get("/host/edit-home/:homeid",hostcontroller.getedithome);
hostrouter.post("/host/edit-home", hostcontroller.postedithome)
hostrouter.post("/host/delete-home/:homeid", hostcontroller.postdeletehome)


exports.hostrouter = hostrouter;
