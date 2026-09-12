const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Get unread notification count
router.get("/unread-count", authMiddleware.verifyToken, notificationController.getUnreadNotificationCount);

// Mark all notifications as read
router.patch("/read-all", authMiddleware.verifyToken, notificationController.markAllNotificationsAsRead);

// Mark single notification as read
router.patch("/:notificationId/read", authMiddleware.verifyToken, notificationController.markNotificationAsRead);

// Get all notifications
router.get("/", authMiddleware.verifyToken, notificationController.getNotifications);

// Create notification
router.post("/", authMiddleware.verifyToken, notificationController.createNotification);

module.exports = router;
