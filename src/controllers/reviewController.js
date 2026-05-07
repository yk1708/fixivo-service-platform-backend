const Review = require("../models/Review");
const ServiceRequest = require("../models/ServiceRequest");
const Provider = require("../models/Provider");

// Submit a review for a completed service request
exports.submitReview = async (req, res) => {
    try {
        const { requestId, rating, comment } = req.body;
        const customerId = req.user._id;

        // Validate input
        if (!requestId || !rating) {
            return res.status(400).json({
                message: "Request ID and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Find the service request
        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) {
            return res.status(404).json({
                message: "Service request not found"
            });
        }

        // Verify the customer owns this request
        if (serviceRequest.customerId.toString() !== customerId.toString()) {
            return res.status(403).json({
                message: "Unauthorized: This request does not belong to you"
            });
        }

        // Check if request is completed
        if (serviceRequest.status !== "completed") {
            return res.status(400).json({
                message: "Can only review completed service requests"
            });
        }

        // Check if already reviewed
        if (serviceRequest.hasBeenReviewed) {
            return res.status(400).json({
                message: "This request has already been reviewed"
            });
        }

        // Create the review
        const review = new Review({
            requestId,
            providerId: serviceRequest.providerId,
            customerId,
            rating,
            comment: comment || ""
        });

        await review.save();

        // Update service request as reviewed
        serviceRequest.hasBeenReviewed = true;
        await serviceRequest.save();

        // Update provider's rating stats
        const allReviews = await Review.find({ providerId: serviceRequest.providerId });
        const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await Provider.findByIdAndUpdate(
            serviceRequest.providerId,
            {
                averageRating: parseFloat(averageRating.toFixed(2)),
                reviewCount: allReviews.length
            }
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review
        });

    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Get all reviews for a specific provider
exports.getProviderReviews = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Find all reviews for the provider
        const reviews = await Review.find({ providerId })
            .populate("customerId", "name email")
            .populate("requestId", "serviceType details")
            .sort({ createdAt: -1 });

        // Calculate stats
        if (reviews.length === 0) {
            return res.json({
                totalReviews: 0,
                averageRating: 0,
                reviews: []
            });
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = parseFloat((totalRating / reviews.length).toFixed(2));

        res.json({
            totalReviews: reviews.length,
            averageRating,
            reviews
        });

    } catch (error) {
        console.error("Error fetching provider reviews:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Get reviews by customer (optional)
exports.getCustomerReviews = async (req, res) => {
    try {
        const customerId = req.user._id;

        const reviews = await Review.find({ customerId })
            .populate("providerId", "name serviceType averageRating reviewCount")
            .populate("requestId", "serviceType")
            .sort({ createdAt: -1 });

        res.json({
            totalReviews: reviews.length,
            reviews
        });

    } catch (error) {
        console.error("Error fetching customer reviews:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};
