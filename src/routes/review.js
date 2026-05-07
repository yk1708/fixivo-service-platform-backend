const express = require('express');
const router = express.Router();
const { submitReview, getProviderReviews, getCustomerReviews } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Submit a review for a completed service request (customer only)
router.post('/submit-review', verifyToken, authorize("customer"), submitReview);

// Get all reviews for a specific provider
router.get('/provider/:providerId', getProviderReviews);

// Get reviews submitted by the current customer
router.get('/my-reviews', verifyToken, authorize("customer"), getCustomerReviews);

module.exports = router;
