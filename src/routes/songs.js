var express = require('express');
const path = require('path');
const User = require("../models/user");
const Song = require("../models/song");
var router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const passport = require("passport");
const multer = require('multer');
const app = require('../app');
const authorize = require('../middleware/authorize');

const Storage = multer.diskStorage({
    // Destination to store image    
    destination: 'src/uploads', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
    }
});

const Upload = multer({
    storage: Storage,
    limits: {
      fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|jpeg|mp3|audio|mpeg)$/)) { 
          // upload only png and jpg format and audio files
          return cb(new Error('Please upload an image or an audio file'))
        }
        cb(undefined, true)
    }
})

router.get('/add-song',authorize, (req, res)=>{
    res.render('add-song.pug');
});

router.post('/add-song',Upload.any(),authorize, async (req, res)=>{
    const body = req.body;
    console.log(body)
    console.log(req.files)
    const newSong = new Song();
    newSong.name = body.songName;
    newSong.artist = body.artist;
    newSong.duration = body.duration;
    newSong.genre=body.genre;
    newSong.song = req.files[1].filename;
    newSong.img = req.files[0].filename;
    const result = await newSong.save();
    res.redirect('/user/home');
});

router.get('/edit-song/:id',authorize, (req,res)=>{
    Song.findById(req.params.id, function(err, song){
        res.render('edit-song.pug', {
          song:song
        });
      });
});

router.post('/edit-song/:id',authorize,Upload.any(),(req,res)=>{
    const body = req.body;
    let song={}
    let query={_id:req.params.id}
    song.name = body.songName;
    song.artist = body.artist;
    song.duration = body.duration;
    song.genre=body.genre;
    song.song = req.files[1].filename;
    song.img = req.files[0].filename;
    Song.updateOne(query,song, function(err){
        if(err){
          console.log(err);
          return;
        }else{
          res.redirect('/user/admin/view-songs')
        }
      })
})


module.exports=router;