const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name: String,
    email:{
        type: String,
        unique:true,
        lowercase: true,
        trim: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    password:{ 
        type: String,
        default: null
    },
    role:{
        type:String,
        enum:["customer", "provider"],
        required:true
    },
    phone: {
        type: String,
        default: ""
    },
    photo: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: ""
    },
    refreshToken:String
},
{timestamps:true});

// Pre-save hook to ensure email is lowercase
// UserSchema.pre('save', function(next) {
//     if (this.email) {
//         this.email = this.email.toLowerCase().trim();
//     }
//     next();
// });

module.exports = mongoose.model("User",UserSchema);