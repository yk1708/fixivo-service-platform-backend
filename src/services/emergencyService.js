const EmergencyRequest = require("../models/EmergencyRequest");
const Provider = require("../models/Provider");
const Notification = require("../models/Notification");
const { emitEmergencyToProviders } = require("../socket/socketSetup");
const { createAndSendNotification } = require("./notificationService");

exports.emergencyService = async (req,res) => {
    try{
        const { location, description, serviceType } = req.body;
        const customerId = req.user._id;
        if(!customerId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token"
            });
        }
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "Valid location is required"
            });
        }
        if(!serviceType){
            return res.status(400).json({
                success: false,
                message: "Service type is required"
            });
        }
        const newEmergency = new EmergencyRequest({
            customerId: customerId,
            location: {
                type: "Point",
                coordinates: location.coordinates 
            },
            description: description,
            serviceType: serviceType,
            status: "pending"
        });
        await newEmergency.save();

        console.log("Emergency Service Debug:");
        console.log("Service Type:", serviceType);
        console.log("Coordinates:", location.coordinates);

        const providers = await Provider.find({
            serviceType: serviceType,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: location.coordinates
                    },
                    $maxDistance: 5000 
                }
            },
            isAvailable: true
        }).limit(5);

        // Assign providers to emergency
        if(providers.length > 0) {
            newEmergency.assignedProviders = providers.map(provider => ({
                providerId: provider._id,
                status: "pending"
            }));
        }

        await newEmergency.save();

        if(providers.length === 0){
            return res.status(200).json({
                success: true,
                message: "Emergency recorded, searching providers",
                data: { emergencyId: newEmergency._id }

            })
        }

        const io = require("../app").get("io");

        await Promise.all(
            providers.map(provider => {
                return createAndSendNotification({
                    io,
                    userId: provider.userId,
                    providerId: provider._id,
                    type: "emergency",
                    title: "Emergency Service Request",
                    message: `New emergency request for ${serviceType} near you.`,
                    relatedId: newEmergency._id,
                    emergencyRequestId: newEmergency._id
                });
            })
        );

        // Emit real-time event to providers
        if (io) {
            emitEmergencyToProviders(io, providers, newEmergency);
        } else {
            console.error("Socket.IO instance not found in app context");
        }


        res.status(201).json({ 
             success: true,
            message: "Emergency request created & providers notified",
            emergency: newEmergency,
            data: {
                emergencyId: newEmergency._id,
                nearbyProviders: providers.length
            },
            status: 201
        });
    }catch(err){
        console.error("Emergency API Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message }); 
    }
}