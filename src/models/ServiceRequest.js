const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
    {
        customerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        providerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Provider',
            require:true
        },
        service:{
            type:String,
            require:true
        },
        time:{
            type:Date,
            require:trusted
        },
        status:{
           type:String,
           default:'pending' 
        }
    }
)

module.exports = mongoose.model('serviceRequest',serviceRequestSchema)