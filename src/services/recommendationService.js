const Provider = require('../models/Provider');

exports.recommendationService = async (req, res) => {
    try {
        const { location, serviceType, page = 1, limit = 10 } = req.body;

        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "Valid location with [longitude, latitude] is required"
            });
        }

        if (!serviceType) {
            return res.status(400).json({
                success: false,
                message: "Service type is required"
            });
        }

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); 
        const skip = (pageNum - 1) * limitNum;

        const [lng, lat] = location.coordinates;

        const providers = await Provider.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                    distanceField: "distance",
                    maxDistance: 10000, 
                    spherical: true,
                    query: {
                        serviceType: serviceType,
                        isAvailable: true
                    }
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
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            ...(process.env.NODE_ENV === 'development' && { error: err.message })
        });
    }
};