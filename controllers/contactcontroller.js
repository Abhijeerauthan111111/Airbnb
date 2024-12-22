const User = require('./../models/user')
const Home = require('./../models/home')
const path = require('path')
const rootdirectory = require("../util/pathutil.js")

exports.postsendEmail =  (req, res, next) => {

    console.log("Email sended")
    // try {
    //     const { hostEmail, guestEmail, homeName } = req.body;
        
    //     const emailData = {
    //         to: hostEmail,
    //         from: process.env.FROM_EMAIL,
    //         subject: `Inquiry about ${homeName}`,
    //         html: `
    //             <div>
    //                 <h2>New Inquiry</h2>
    //                 <p>A user (${guestEmail}) is interested in your property: ${homeName}</p>
    //             </div>
    //         `
    //     };
        
    //     await sendgrid.send(emailData);
    //     req.flash('success', 'Email sent successfully');
    //     res.redirect('back');
    // } catch (error) {
    //     req.flash('error', 'Failed to send email');
    //     res.redirect('back');
    // }
};