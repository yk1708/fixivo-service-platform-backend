const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/verified-providers", customerController.getVerifiedProviders);
router.get("/provider/:providerId", customerController.getProviderProfile);
router.get("/emergencies/:emergencyId/status", authMiddleware.verifyToken, customerController.getEmergencyStatus);

// Customer profile & account routes
router.get("/profile", authMiddleware.verifyToken, customerController.getCustomerProfile);
router.put("/profile", authMiddleware.verifyToken, customerController.updateCustomerProfile);
router.post("/logout", authMiddleware.verifyToken, customerController.logoutCustomer);

module.exports = router;