const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/verified-providers", customerController.getVerifiedProviders);
router.get("/emergencies/:emergencyId/status", authMiddleware.verifyToken, customerController.getEmergencyStatus);

module.exports = router;