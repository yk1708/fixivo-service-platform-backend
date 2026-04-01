const mongoose = require("mongoose");
const Provider = require("./Provider");

const serviceRequestSchema = new mongoose.Schema(
    {
        providerId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: true
        },
        customerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        serviceType:{
            type:String,
            required:true
        },
        details:{
            type:String,
            required:true
        },
        scheduledTime: Date,
        status:{
            type:String,
            enum:["pending","accepted","rejected","completed"],
            default:"pending"
        },
        acceptedAt:{
            type:Date
        },
        isAccepted:{
            type:Boolean,
            default:false
        },
        otp:{
            type:String,
            default:null
        },
        otpExpires:{
            type:Date,
            default:null
        },
        completedAt:{
            type:Date,
            default:null
        }
    }
)

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);