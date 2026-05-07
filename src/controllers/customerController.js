const Provider = require('../models/Provider');
const EmergencyRequest = require('../models/EmergencyRequest');
const Review = require('../models/Review');

exports.getVerifiedProviders = async (req, res) => {
    try {
        const providers = await Provider.find({ isVerified: true })
            .populate({
                path: "userId",
                select: "email name role"
            })
            .select("userId name email phone serviceType experience rating averageRating reviewCount location availability isVerified");
        const filteredProviders = providers.filter(p => p.userId);
        res.status(200).json(filteredProviders);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getProviderProfile = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Get provider details
        const provider = await Provider.findById(providerId)
            .populate({
                path: "userId",
                select: "email name"
            });

        if (!provider) {
            return res.status(404).json({
                message: "Provider not found"
            });
        }

        // Get provider's reviews
        const reviews = await Review.find({ providerId })
            .populate("customerId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            provider: {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                serviceType: provider.serviceType,
                experience: provider.experience,
                averageRating: provider.averageRating,
                reviewCount: provider.reviewCount,
                location: provider.location,
                availability: provider.availability,
                isVerified: provider.isVerified
            },
            reviews: reviews.map(review => ({
                id: review._id,
                rating: review.rating,
                comment: review.comment,
                customerName: review.customerId.name,
                createdAt: review.createdAt
            })),
            totalReviews: reviews.length
        });

    } catch (error) {
        console.error("Error fetching provider profile:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.getEmergencyStatus = async (req, res) => {
    try{
        const { emergencyId } = req.params;
        const userId = req.user._id;

        const emergency = await EmergencyRequest.findOne(
            {
                _id: emergencyId,
                customerId: userId
            }
        )
        .populate("assignedProviders.providerId", "name phone")
        .populate("assignedProviderId", "name phone");

        if(!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency request not found"
            });
        }

        res.json({
            success: true,
            emergency: {
                id: emergency._id,
                serviceType: emergency.serviceType,
                description: emergency.description,
                location: emergency.location,
                status: emergency.status,
                assignedProvider: emergency.assignedProviderId ? {
                    id: emergency.assignedProviderId._id,
                    name: emergency.assignedProviderId.name,
                    phone: emergency.assignedProviderId.phone
                } : null,
                assignedProviders: emergency.assignedProviders.map(ap => ({
                    id: ap.providerId._id,
                    name: ap.providerId.name,
                    phone: ap.providerId.phone
                }))
            }
        });
    }catch(err){
        res.status(500).json({ message: "Internal Server Error" });
    }
};

