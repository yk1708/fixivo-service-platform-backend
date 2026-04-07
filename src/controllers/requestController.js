const ServiceRequest = require('../models/ServiceRequest');
const Provider = require('../models/Provider');
const User = require('../models/User');

exports.sendRequestToProvider = async(req,res) => {
    try{
        const {providerId, requestDetails} = req.body;
        
        console.log("User from token:", req.user)
        const customerId = req.user._id || req.user.id;
        
        if(!customerId) {
            return res.status(401).json({ message: "User ID not found in token" });
        }

        console.log("Request received:", { providerId, customerId, requestDetails });

        if(!providerId || !requestDetails){
            return res.status(400).json({ message: "Provider ID and request details are required" });
        }

        if(!requestDetails.serviceType || !requestDetails.details) {
            return res.status(400).json({ message: "Service type and details are required in requestDetails" });
        }

        const provider = await Provider.findById(providerId);
        if(!provider || !provider.isVerified){
            return res.status(404).json({ message: "Provider Not Found or Not Verified" });
        }

        const newRequest = new ServiceRequest({
            providerId: providerId,
            customerId: customerId,
            serviceType: requestDetails.serviceType,
            details: requestDetails.details,
            scheduledTime: requestDetails.scheduledTime || null,
            status: "pending"
        });

        await newRequest.save();
        await newRequest.populate('providerId customerId');

        res.status(201).json({ 
            message: "Request sent to provider successfully",
            request: newRequest 
        });

    } catch (err) {
        console.error("Error in sendRequestToProvider:", err);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: err.message
        });
    }
}

exports.getCustomerRequests = async (req,res) => {
    try{
        const customerId = req.user._id || req.user.id;
        console.log("User from token:",req.user);
        if(!customerId) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const requests = await ServiceRequest.find({ customerId }).populate("providerId", "serviceType").populate("customerId", "name email");
        res.json({ requests });
    }catch(err){
       console.error("Error in getCustomerRequests:", err);
       res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

exports.acceptRequest = async (req,res) => {
    try{
        const requestId = req.params.id;
        if(!requestId){
            return res.status(400).json({ messsage: "Request ID is required" });
        }

        const request =  await ServiceRequest.findById(requestId);
        if(!request){
            return res.status(404).json({ message: "Request Not Found" });
        }

        if(request.status !== "pending"){
            return res.status(400).json({ message: "Request is not pending" });
        }
        request.status = "accepted";
        await request.save();
        res.json({ message: "Request accepted successfully", request });
    }catch(err){
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

exports.rejectRequest = async (req,res) => {
    try{
        const requestId = req.params.id;
        if(!requestId){
            return res.status(400).json({ messsage: "Request ID is required" });
        }
        const request =  await ServiceRequest.findById(requestId);
        if(!request){
            return res.status(404).json({ message: "Request Not Found" });
        }  
        if(request.status !== "pending"){
            return res.status(400).json({ message: "Request is not pending" });
        }
        request.status = "rejected";
        await request.save();
        res.json({ message: "Request rejected successfully", request });
    }catch(err){
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
} 


