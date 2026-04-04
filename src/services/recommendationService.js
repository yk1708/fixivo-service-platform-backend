const Provider = require('../models/Provider');

exports.recommendationService = async (req, res) => {
    try {
        const { location, serviceType, page = 1, limit = 10 } = req.body;

        // ✅ Validate location
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "Valid location with [longitude, latitude] is required"
            });
        }

        // ✅ Validate serviceType
        if (!serviceType) {
            return res.status(400).json({
                success: false,
                message: "Service type is required"
            });
        }

        // ✅ Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 to prevent abuse
        const skip = (pageNum - 1) * limitNum;

        const [lng, lat] = location.coordinates;

        // ✅ Find nearby providers with geospatial query
        const providers = await Provider.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                    distanceField: "distance",
                    maxDistance: 10000, // 10 km
                    spherical: true,
                }
            },
            {
                $match: {
                    // Handle serviceType as array or string
                    $expr: {
                        $eq: ["$serviceType", serviceType]
                    },
                    isAvailable: true
                }
            },
            {
                $addFields: {
                    distanceInKm: { $divide: ["$distance", 1000] }
                }
            },
            {
                $sort: {
                    rating: -1,     
                    distance: 1    
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limitNum
            }
        ]);

        // ✅ Get total count for pagination metadata
        const totalCount = await Provider.countDocuments({
            isAvailable: true
        });

        return res.status(200).json({
            success: true,
            count: providers.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum)
            },
            message: providers.length === 0 ? "No providers found for the given criteria" : null,
            providers
        });

    } catch (err) {
        console.error("Error in recommendationService:", err);
        // ✅ Don't expose internal error details in production
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            // Only show error details in development
            ...(process.env.NODE_ENV === 'development' && { error: err.message })
        });
    }
};