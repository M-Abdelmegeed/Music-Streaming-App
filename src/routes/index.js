var express = require('express');
const passport=require('passport')
var router = express.Router();
require("dotenv").config();
const multer = require('multer');
const User = require("../models/user");


const imageStorage = multer.diskStorage({
  // Destination to store image    
  destination: 'src/uploads', 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() 
           + path.extname(file.originalname))
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1000000 // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) { 
        // upload only png and jpg format
        return cb(new Error('Please upload a Image'))
      }
      cb(undefined, true)
  }
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home.pug');
});
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
router.get("/sign-up", (req, res) => {
  res.render("sign-up.pug");
});
router.get("/login", (req, res) => {
    res.render("login.pug");
});


router.post("/sign-up", imageUpload.single('image'), async (req, res) => {
  const body = req.body;
  console.log(req.file);
  console.log(body)
  const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string()
          .pattern(/^[0-9]+$/)
          .required(),
      password: Joi.string().required().min(5),
      image:Joi.string(),
      role:Joi.string(),
      username: Joi.string().required().min(5)
  });

  const { error } = schema.validate(body);

  if (error) {
    res.render("sign-up", { error })
    // res.status(400).send(error);
  } else {
      const newUser = new User({
          name: body.name,
          email: body.email,
          phoneNumber: body.phoneNumber,
          password: body.password,
          image:req.file.filename,
          role:"USER",
          username:body.username,
      });

      bcrypt.hash(
          newUser.password + process.env.PEPPER,
          +process.env.SALT_ROUNDS || "",
          async (err, hash) => {
              newUser.password = hash;
              await newUser.save();
              // res.send(newUser)
              res.redirect('/');
          }
      );
  }
});


router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
      successRedirect: "/user/home",
      failureRedirect: "/login",
  })(req, res, next);
});

passport.deserializeUser(async (id,done)=>{
  const user = await User.findById(id) 
  done(null,user);
});
// router.get('/auth/google',
// passport.authenticate('google', { scope: ['profile'] }));

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
//   function(req, res) {
//     res.redirect('/');
//   });
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    const user = await User.findOne({googleId: profile.id}).catch(err => cb(err));
    if (user) {
        done(null, user);
    }else {
        const newUser = new User({
            name:profile._json.name,
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
 
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/user/login' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/');
  });

module.exports = router;
