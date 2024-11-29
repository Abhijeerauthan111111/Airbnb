const express = require('express')
// const path = require('path');
const storecontroller = require('../controllers/storecontroller')
// const rootdirectory = require('../util/pathutil');

const storeRouter = express.Router();

storeRouter.get('/',storecontroller.getindex)
storeRouter.get('/homes',storecontroller.gethomes)
storeRouter.get('/homes/:homeid',storecontroller.gethomedetails)
storeRouter.get('/homes',storecontroller.gethomes)
storeRouter.get('/favourites',storecontroller.getfavourite)
storeRouter.post('/favourites',storecontroller.postfavourite)
storeRouter.post('/favourites/delete/:homeid',storecontroller.postdeletefavourite)
storeRouter.get('/rules/:homeid',storecontroller.getrules)

module.exports = storeRouter;