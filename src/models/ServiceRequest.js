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
            enum:["pending","accepted","rejected"],
            default:"pending"
        },
        acceptedAt:{
            type:Date
        },
        isAccepted:{
            type:Boolean,
            default:false
        }
    }
)

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);