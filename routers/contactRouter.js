const express = require('express')
const storecontroller = require('../controllers/contactcontroller')


const contactRouter = express.Router();


contactRouter.post('/sendemail',storecontroller.postsendEmail)


module.exports = contactRouter;