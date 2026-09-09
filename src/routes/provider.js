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
router.get("/emergencies/history", authMiddleware.verifyToken, providerController.getEmergencyHistory);
router.post("/emergencies/accept", authMiddleware.verifyToken, providerController.acceptEmergency);
router.post("/emergencies/reject", authMiddleware.verifyToken, providerController.rejectEmergency);

// Provider Details & Profile routes
router.get("/details", authMiddleware.verifyToken, providerController.getProviderDetails);
router.get("/details/:providerId", (req, res, next) => {
    if (req.headers.authorization) {
        return authMiddleware.verifyToken(req, res, next);
    }
    next();
}, providerController.getProviderDetails);
router.get("/profile", authMiddleware.verifyToken, providerController.getProviderDetails);
router.get("/me", authMiddleware.verifyToken, providerController.getProviderDetails);

router.get("/data-analysis", authMiddleware.verifyToken, providerController.providerDataAnalysis);  
module.exports = router;