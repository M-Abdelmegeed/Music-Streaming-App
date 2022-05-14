const mongoose = require("mongoose");
// const Song = require('./song')
// const image= require('./image');
const validateEmail = function (email) {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
// const songSchema= new mongoose.Schema({
//     name:{type:String, required:true},
//     song:{type:String, required:true},
//     artist:{type:String, required:true},
//     img:{type:String},
//     duration:{type:String, required:true},
// });

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: [validateEmail, "invalid email"],
    },
    name: {
        type: String,
        required:true
    },
    username:{
        type:String,
    },
    phoneNumber:{
      type:String  
    },
    password: {
        type: String ,
    },
    image: {type:String},
    googleId: {type:String, unique: true, sparse:true},
    songs:[{type:mongoose.Types.ObjectId,ref: "song"}],
    role:{type:String, default:"USER"}
});

module.exports = mongoose.model("user", schema);

