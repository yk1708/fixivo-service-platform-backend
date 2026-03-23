const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name: String,
    email:{
        type: String,
        unique:true    
    },
    password: String,
    refreshToken:String
},
{timestamp:true});

module.exports = mongoose.model("User",UserSchema);