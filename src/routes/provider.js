const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const providerController = require("../controllers/providerController");

router.put("/complete-profile",authMiddleware.verifyToken, providerController.completeProfile);
router.put("/complete-work/:requestId",authMiddleware.verifyToken, providerController.completeWork);
router.post("/verify-otp/:requestId", authMiddleware.verifyToken, providerController.verifyOtpAndComplete);
router.get("/completed-requests", authMiddleware.verifyToken, providerController.getMyCompletedRequests);

// NEW: Emergency request routes
router.get("/emergencies/assigned", authMiddleware.verifyToken, providerController.getAssignedEmergencies);
router.post("/emergencies/accept", authMiddleware.verifyToken, providerController.acceptEmergency);
router.post("/emergencies/reject", authMiddleware.verifyToken, providerController.rejectEmergency);

module.exports = router;