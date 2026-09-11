const Provider = require('../models/Provider');
const EmergencyRequest = require('../models/EmergencyRequest');
const Review = require('../models/Review');
const User = require('../models/User');
// const client = require('../redis/redis');

exports.getVerifiedProviders = async (req, res) => {
    try {
        // const cachedKey = "verified-providers:all"
        // const cachedUsers = await client.get(cachedKey);
        // if(cachedUsers){
        //     console.log("Data Came from REDIS",cachedUsers);
        //     return res.json(JSON.parse(cachedUsers));
        // }
        const providers = await Provider.find({ isVerified: true })
            .populate({
                path: "userId",
                select: "email name role"
            })
            .select("userId name email phone serviceType experience rating averageRating reviewCount location availability isVerified");

        const filteredProviders = providers.filter(p => p.userId);
        
        // Cache the correctly filtered data
        // await client.set(cachedKey, JSON.stringify(filteredProviders), { EX: 3600 });

        console.log("Data Came from MongoDB");
        res.status(200).json(filteredProviders);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", err });
        console.log(err);
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

// Get logged-in customer profile (registration info + profile photo)
exports.getCustomerProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Customer profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer profile retrieved successfully",
            user: {
                _id: user._id,
                id: user._id,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                photo: user.photo || user.profilePic || "",
                profilePic: user.photo || user.profilePic || "",
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (err) {
        console.error("Get Customer Profile Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// Update customer profile (e.g. add/update photo, name, phone)
exports.updateCustomerProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone, photo, profilePic } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (photo !== undefined) {
            user.photo = photo;
            user.profilePic = photo;
        } else if (profilePic !== undefined) {
            user.photo = profilePic;
            user.profilePic = profilePic;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                id: user._id,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                photo: user.photo || user.profilePic || "",
                profilePic: user.photo || user.profilePic || "",
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (err) {
        console.error("Update Customer Profile Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

// Customer logout
exports.logoutCustomer = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        return res.status(200).json({
            success: true,
            message: "Customer logged out successfully"
        });
    } catch (err) {
        console.error("Customer Logout Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};

