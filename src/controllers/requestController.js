const ServiceRequest = require("../models/ServiceRequest");
const Provider = require("../models/Provider");
const User = require("../models/User");

exports.sendRequestToProvider = async (req, res) => {
  try {
    const { providerId, requestDetails } = req.body;

    console.log("User from token:", req.user);
    const customerId = req.user._id;

    if (!customerId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    console.log("Request received:", {
      providerId,
      customerId,
      requestDetails,
    });

    if (!providerId || !requestDetails) {
      return res
        .status(400)
        .json({ message: "Provider ID and request details are required" });
    }

    if (!requestDetails.serviceType || !requestDetails.details) {
      return res
        .status(400)
        .json({
          message: "Service type and details are required in requestDetails",
        });
    }

    const provider = await Provider.findById(providerId);
    if (!provider || !provider.isVerified) {
      return res
        .status(404)
        .json({ message: "Provider Not Found or Not Verified" });
    }

    const newRequest = new ServiceRequest({
      providerId: providerId,
      customerId: customerId,
      serviceType: requestDetails.serviceType,
      details: requestDetails.details,
      scheduledTime: requestDetails.scheduledTime || null,
      status: "pending",
    });

    await newRequest.save();
    await newRequest.populate("providerId customerId");

    res.status(201).json({
      message: "Request sent to provider successfully",
      request: newRequest,
    });
  } catch (err) {
    console.error("Error in sendRequestToProvider:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

exports.getCustomerRequests = async (req, res) => {
  try {
    const customerId = req.user._id;
    console.log("User from token:", req.user);
    if (!customerId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }
    const requests = await ServiceRequest.find({ customerId })
      .populate("providerId", "serviceType")
      .populate("customerId", "name email");
    res.json({ requests });
  } catch (err) {
    console.error("Error in getCustomerRequests:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

exports.seeRequestsInsideProviderDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    // Since providerId in ServiceRequest refers to the Provider collection _id,
    // we must first find the Provider document associated with this user
    const provider = await Provider.findOne({ userId });
    
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const requests = await ServiceRequest.find({ providerId: provider._id })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error("Error in seeRequestsInsideProviderDashboard:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getCustomerRequestsStatus = async (req, res) => {
  try {
    const customerId = req.user._id;

    console.log("User from token:", req.user);

    if (!customerId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    const requests = await ServiceRequest.find({ customerId })
      .populate("providerId", "name serviceType phone email")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      customerId,
      totalRequests: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider || request.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }
    request.status = "accepted";
    request.acceptedAt = new Date();
    await request.save();
    res.json({ message: "Request accepted successfully", request });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request Not Found" });
    }
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider || request.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }
    request.status = "rejected";
    await request.save();
    res.json({ message: "Request rejected successfully", request });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
