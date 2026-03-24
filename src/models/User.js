const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name: String,
    email:{
        type: String,
        unique:true    
    },
    password: String,
    role:{
        type:String,
        enum:["customer", "Provider"],
        required:true
    },
    refreshToken:String
},
{timestamps:true});

module.exports = mongoose.model("User",UserSchema);