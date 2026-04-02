const mongoose = require("mongoose");

const EmergencyRequestSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        },
        description: String,
        serviceType: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "completed", "cancelled"],
            default: "pending"
        },
        assignedProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider",
            default: null
        },
        acceptedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Create geospatial index for location queries
EmergencyRequestSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model("EmergencyRequest", EmergencyRequestSchema);
