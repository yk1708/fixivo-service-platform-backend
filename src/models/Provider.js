const mongoose = require("mongoose");

const ProviderSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: String, 
        email: {
            type: String,
            unique: true,
        },
        phone: String,
        serviceType: {
            type: String,
            required: true
        },
        experience: Number, 
        rating: {
            type: Number,
            default: 0
        },
        location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [0, 0] },
        },
        availability: String,
        isVerified: {
            type: Boolean,
            default: false  
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Provider", ProviderSchema)