const mongoose = require('mongoose');
const songSchema= new mongoose.Schema({
    name:{type:String, required:true},
    song:{type:String},
    artist:{type:String, required:true},
    img:{type:String},
    duration:{type:String, required:true},
    genre:{type:String},
    likedBy:[{type:mongoose.Types.ObjectId, ref: "user"}]
});

const Song=mongoose.model("song", songSchema);
module.exports=Song