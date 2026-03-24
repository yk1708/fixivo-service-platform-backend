const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.get("/verified-providers",customerController.getVerifiedProviders);

module.exports = router;