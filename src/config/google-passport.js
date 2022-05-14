const User = require("../models/user");
const passport=require('passport')
require("dotenv").config();
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// module.exports =(passport) =>{passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/user/oauth/google/redirect",
//     passReqToCallback: true,
//     scope: [ 'profile', 'email' ],
//     state: true
//   },
//   async function(accessToken, refreshToken, profile, done) {
//     console.log(profile);
//     const user = await User.findOne({googleId: profile.id}).catch(err => cb(err));
//     if (user) {
//         done(null, user);
//     }else {
//         const newUser = new User({
//             firstName: profile._json.given_name,
//             lastName: profile._json.family_name,            
//             email: profile._json.email,
//             googleId: profile.id,
//             userImage: profile._json.picture});
//         const result = await newUser.save()
//         done(null, result);
//     }
// }
// ))
// };
// //serialize user
// passport.serializeUser((user,done)=>done(null,user.id))

// //deserialize user
// passport.deserializeUser(async (id,done)=>{
//     const user = await User.findById(id) 
//     done(null,user);
// })
const GoogleStrategy = require('passport-google-oauth20');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: ' http://localhost:3000/auth/google/callback',
        scope: [ 'profile', 'email' ],
        state: true
    },
    async function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        const user = await User.findOne({googleId: profile.id}).catch(err => cb(err));
        if (user) {
            done(null, user);
        }else {
            const newUser = new User({
                firstName: profile._json.given_name,
                lastName: profile._json.family_name,                
                email: profile._json.email,
                googleId: profile.id,
                userImage: profile._json.picture});
            const result = await newUser.save()
            done(null, result);
        }
    }
    ));
    //serialize user
    passport.serializeUser((user,done)=>done(null,user.id))

    //deserialize user
    passport.deserializeUser(async (id,done)=>{
        const user = await User.findById(id) 
        done(null,user);
    }
    )}
