const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name: String,
    email:{
        type: String,
        unique:true,
        lowercase: true,
        trim: true
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

// Pre-save hook to ensure email is lowercase
// UserSchema.pre('save', function(next) {
//     if (this.email) {
//         this.email = this.email.toLowerCase().trim();
//     }
//     next();
// });

module.exports = mongoose.model("User",UserSchema);