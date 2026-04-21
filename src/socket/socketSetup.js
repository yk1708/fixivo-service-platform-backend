// Socket.IO helper functions for real-time events

exports.emitEmergencyToProviders = (io, providers, emergency) => {
    providers.forEach(provider => {
        io.to(`provider_${provider._id}`).emit("newEmergency", {
            emergencyId: emergency._id,
            serviceType: emergency.serviceType,
            description: emergency.description,
            location: emergency.location,
            customerId: emergency.customerId,
            createdAt: emergency.createdAt
        });
    });
};

exports.emitEmergencyAccepted = (io, emergency) => {
    // Notify customer that emergency is accepted
    io.to(`customer_${emergency.customerId}`).emit("emergencyAccepted", {
        emergencyId: emergency._id,
        providerId: emergency.assignedProviderId,
        acceptedAt: emergency.acceptedAt
    });

    // Notify other providers that emergency is no longer available
    emergency.assignedProviders.forEach(assigned => {
        if(String(assigned.providerId) !== String(emergency.assignedProviderId)) {
            io.to(`provider_${assigned.providerId}`).emit("emergencyTaken", {
                emergencyId: emergency._id
            });
        }
    });
};

exports.emitEmergencyRejected = (io, emergencyId, providerId) => {
    io.to(`provider_${providerId}`).emit("emergencyRejected", {
        emergencyId: emergencyId,
        message: "Emergency request rejected"
    });
};
