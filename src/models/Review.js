const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            required: true
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            required: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
