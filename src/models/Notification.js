const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            default: "Notification"
        },
        type: {
            type: String,
            enum: ["emergency", "request", "message", "review", "system", "general"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            default: null
        },
        emergencyRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmergencyRequest",
            default: null
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
