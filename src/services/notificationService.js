const Notification = require("../models/Notification");

/**
 * Creates a notification in the database and emits real-time socket events.
 * 
 * @param {Object} options
 * @param {Object} [options.io] - Optional Socket.IO server instance
 * @param {string|mongoose.Types.ObjectId} options.userId - Recipient User ID
 * @param {string} [options.title="Notification"] - Notification title
 * @param {string} options.message - Notification message body
 * @param {string} options.type - "emergency" | "request" | "message" | "review" | "system" | "general"
 * @param {string|mongoose.Types.ObjectId} [options.relatedId] - Related generic ID
 * @param {string|mongoose.Types.ObjectId} [options.requestId] - Associated ServiceRequest ID
 * @param {string|mongoose.Types.ObjectId} [options.emergencyRequestId] - Associated EmergencyRequest ID
 * @param {string|mongoose.Types.ObjectId} [options.providerId] - Optional Provider document ID for socket room dispatch
 * @param {string|mongoose.Types.ObjectId} [options.customerId] - Optional Customer User ID for socket room dispatch
 * @returns {Promise<Object>} The created notification document
 */
exports.createAndSendNotification = async ({
    io,
    userId,
    title = "Notification",
    message,
    type = "general",
    relatedId = null,
    requestId = null,
    emergencyRequestId = null,
    providerId = null,
    customerId = null
}) => {
    try {
        if (!userId || !message) {
            console.warn("Notification creation skipped: userId and message are required.");
            return null;
        }

        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            relatedId: relatedId || requestId || emergencyRequestId || null,
            requestId: requestId || null,
            emergencyRequestId: emergencyRequestId || null
        });

        // Resolve Socket.IO instance if not passed
        let socketIO = io;
        if (!socketIO) {
            try {
                const app = require("../app");
                socketIO = app.get("io");
            } catch (socketErr) {
                // Ignore if app is not yet initialized
            }
        }

        if (socketIO) {
            const payload = {
                _id: notification._id,
                id: notification._id,
                userId: notification.userId,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                relatedId: notification.relatedId,
                requestId: notification.requestId,
                emergencyRequestId: notification.emergencyRequestId,
                isRead: notification.isRead,
                createdAt: notification.createdAt
            };

            // Emit to direct user room
            socketIO.to(`user_${userId}`).emit("newNotification", payload);
            socketIO.to(`user_${userId}`).emit("notification", payload);

            // Also emit to provider room if providerId was provided
            if (providerId) {
                socketIO.to(`provider_${providerId}`).emit("newNotification", payload);
                socketIO.to(`provider_${providerId}`).emit("notification", payload);
            }

            // Also emit to customer room if customerId was provided
            if (customerId) {
                socketIO.to(`customer_${customerId}`).emit("newNotification", payload);
                socketIO.to(`customer_${customerId}`).emit("notification", payload);
            }
        }

        return notification;
    } catch (error) {
        console.error("Error in createAndSendNotification:", error);
        return null;
    }
};
