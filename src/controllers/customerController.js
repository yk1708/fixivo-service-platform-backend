const Provider = require('../models/Provider');
const EmergencyRequest = require('../models/EmergencyRequest');

exports.getVerifiedProviders = async (req, res) => {
    try {
        const providers = await Provider.find({ isVerified: true })
            .populate({
                path: "userId",
                select: "email name role"
            });
        const filteredProviders = providers.filter(p => p.userId);
        res.status(200).json(filteredProviders);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
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

