var express = require('express');
const path = require('path');
const User = require("../models/user");
const Song = require("../models/song");
var router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const passport = require("passport");
const multer = require('multer');
const authorize  = require('../middleware/authorize');


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

// console.log(imageUpload);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Unauthorized to access this page');
});

router.get("/home", async (req, res, next)=>{
  const {page=1, limit=4, q=""}= req.query;
  const cnt=await Song.countDocuments({})
  // // console.log(cnt)
  const page_count=Math.ceil(cnt/(limit))
  const songs = Song.find({"name":{$regex:q,$options:"i"}}, null, {sort: {name: 1}})
  .skip((page-1)*limit)
  .limit(limit*1)
  .then((result)=>{
    res.render("user-page.pug", {songs:result,url:req.originalUrl,pageno:page, noOfPages: page_count});
  }).catch((err)=>{
  console.log(err);
  });
});
router.get("/likes/:userID", async (req, res)=>{
const user = User.findById(req.params.userID);
const songs2 = await User.findById(req.params.userID).select("songs").populate("songs");
const songs = await User.findById(req.params.userID).select("songs").populate("songs").then((result)=>{
res.render("user-likes.pug", {songs:result.songs, url:req.originalUrl});
}).catch((err)=>{
console.log(err);
});
console.log(songs2.songs[0].name)
});

router.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/user/login");
});

router.get("/edit/:id", (req, res) =>
User.findById(req.params.id, function(err, user){
  res.render('edit-user', {
    user:user
  })
})
);
router.get("/delete/:id", async (req, res) => {
  const id=req.params.id
  await User.findByIdAndRemove(id)
  .then(()=>{
    res.redirect('/user/admin/view-users/')
  })
  .catch((err)=>{
    console.log(err);
  });
});

router.get("/delete-song/:id",authorize, async (req, res) => {
  const id=req.params.id
  await Song.findByIdAndRemove(id)
  .then(()=>{
    res.redirect('/user/admin/view-songs/')
  })
  .catch((err)=>{
    console.log(err);
  });
});

router.get("/song/add/:id",authorize, (req, res)=>{
  User.findById(req.params.id, function(err, user){
    res.render('add-song', {
      user:user
    })
})
});

router.get("/admin/view-users/", authorize ,async (req,res)=>{
const userSongs= await User.find().select("songs").populate("songs");
console.log(userSongs);
const songsName=[];
userSongs.forEach((item)=> {
  const temp = [];
  item.songs.forEach((song) => {
    temp.push(song.name);
  });
  songsName.push(temp);
})

console.log(songsName);
const user = User.find().then((result)=>{
  res.render('admin-view.pug', {users: result, songsName:songsName})
})
.catch((err)=>{
  console.log(err);
});
});

router.get("/admin/view-songs/", authorize , (req, res)=>{
const songs = Song.find().then((result)=>{
  res.render('admin-songs.pug', {songs: result})
})
.catch((err)=>{
  console.log(err);
});
});

router.get("/genres/", (req, res)=>{
  const songs = Song.find().then((result)=>{
    res.render('user-genres.pug', {songs: result, url:req.originalUrl})
  })
  .catch((err)=>{
    console.log(err);
  });
  });

// router.post("song/add/:id",async (req, res)=>{
//   const body = req.body;
//   const newSong = new Song();
//   newSong.songName = body.songName;
//   newSong.artist = body.artist;
//   newSong.duration = body.duration;
//   const result = await newSong.save();
//   let query={_id:req.params.id}
//   User.Update(query,{ $push: { songs: newSong}}, function(err){
//     if(err){
//       console.log(err);
//       return;
//     }else{
//       res.redirect('/home')
//     }
//   });
//   // res.redirect('/home');
// });

router.post('/:userID/like/:songID', async (req, res)=>{
// console.log(req.params.songID)
// console.log(req.params.userID)
console.log(req.query);
const url=req.query.redirect;
console.log(url);
const user = await User.findById(req.params.userID).select("songs");
console.log(user);
const check = user.songs.findIndex((item)=>item._id==req.params.songID);
console.log(check);
if(check>=0){
const user = await User.findByIdAndUpdate(req.params.userID, {$pull:{songs:req.params.songID}},{new:true})
}else{
const user = await User.findByIdAndUpdate(req.params.userID, {$push:{songs:req.params.songID}},{new:true})
}
// console.log(user)
res.redirect(url)
});


router.post("/edit/:id", (req, res) => {
    let user={}
    let query={_id:req.params.id}
    const body = req.body;
    user.name = body.name;
    user.email = body.email;
    user.phoneNumber = body.phoneNumber;
    user.username=body.username;
    User.updateOne(query,user, function(err){
      if(err){
        console.log(err);
        return;
      }else{
        res.redirect('/user/home/');
      }
    })
    });


module.exports = router;
