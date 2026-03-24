const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const providerController = require("../controllers/providerController");

router.put("/complete-profile",authMiddleware.verifyToken, providerController.completeProfile);

module.exports = router;