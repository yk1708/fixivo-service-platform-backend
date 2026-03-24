
const Provider = require('../models/Provider');

exports.getVerifiedProviders = async (req, res) => {
    try {
        const providers = await Provider.find({ isVerified: true })
            .populate({
                path: "userId",
                match: { role: "provider" },
                select: "email name role"
            });
        const filteredProviders = providers.filter(p => p.userId);
        res.status(200).json(filteredProviders);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};