const express = require('express');
const router = express.Router();
const { sendRequestToProvider, getCustomerRequests,acceptRequest,rejectRequest,AllRequests } = require('../controllers/requestController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/send-request', verifyToken, sendRequestToProvider);
router.get('/customer-requests', verifyToken, getCustomerRequests);
router.post('/accept-request/:id', verifyToken, acceptRequest);
router.post('/reject-request/:id', verifyToken, rejectRequest);
// router.get('/all-requests', verifyToken, AllRequests);

module.exports = router;