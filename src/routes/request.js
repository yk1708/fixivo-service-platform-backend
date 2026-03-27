const express = require('express');
const router = express.Router();
const { sendRequestToProvider, getCustomerRequests, findAndSendRequests } = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/send-request', verifyToken, sendRequestToProvider);
router.get('/customer-requests', verifyToken, getCustomerRequests);
// router.post('/find-and-send-requests', verifyToken, findAndSendRequests);

module.exports = router;