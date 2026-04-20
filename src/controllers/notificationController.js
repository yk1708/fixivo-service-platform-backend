const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id; 
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching notifications" });
    }
};