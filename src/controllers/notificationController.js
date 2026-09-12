const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { createAndSendNotification } = require("../services/notificationService");

/* Request accepted, Request rejected, Emergency request received, Request completed */
exports.createNotification = async (req, res) => {
    try {
        const {
            userId,
            title,
            message,
            type,
            requestId,
            emergencyRequestId
        } = req.body;

        if (!userId || !message || !type) {
            return res.status(400).json({
                success: false,
                message: "userId, message and type are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (requestId && !mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

        if (
            emergencyRequestId &&
            !mongoose.Types.ObjectId.isValid(emergencyRequestId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency request ID"
            });
        }

        const io = req.app.get("io");
        const notification = await createAndSendNotification({
            io,
            userId,
            title: title || "Notification",
            message,
            type,
            requestId: requestId || null,
            emergencyRequestId: emergencyRequestId || null
        });

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification
        });

    } catch (err) {
        console.error("Create Notification Error:", err);


        return res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token"
            });
        }

        const page = Math.max(
            parseInt(req.query.page, 10) || 1,
            1
        );

        const requestedLimit =
            parseInt(req.query.limit, 10) || 20;

        // Maximum 50 notifications per request
        const limit = Math.min(
            Math.max(requestedLimit, 1),
            50
        );

        const skip = (page - 1) * limit;

        const [
            notifications,
            totalNotifications,
            unreadCount
        ] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Notification.countDocuments({
                userId
            }),

            Notification.countDocuments({
                userId,
                isRead: false
            })
        ]);

        const totalPages = Math.ceil(
            totalNotifications / limit
        );

        return res.status(200).json({
            success: true,

            notifications,

            unreadCount,

            pagination: {
                currentPage: page,
                limit,
                totalNotifications,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (err) {
        console.error("Get Notifications Error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};

exports.getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token"
            });
        }

        const unreadCount = await Notification.countDocuments({
            userId,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            unreadCount
        });

    } catch (err) {
        console.error(
            "Get Unread Notification Count Error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread notification count"
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token"
            });
        }

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: "Notification ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        const notification =
            await Notification.findOneAndUpdate(
                {
                    _id: notificationId,
                    userId: userId
                },
                {
                    $set: {
                        isRead: true
                    }
                },
                {
                    new: true
                }
            ).lean();

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (err) {
        console.error(
            "Mark Notification As Read Error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read"
        });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token"
            });
        }

        const result = await Notification.updateMany(
            {
                userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            updatedCount: result.modifiedCount
        });

    } catch (err) {
        console.error(
            "Mark All Notifications As Read Error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read"
        });
    }
};