const User = require("../models/User");
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");
const ServiceRequest = require("../models/ServiceRequest");
const generateOTP = require("../utils/generateOTP");
const crypto = require("crypto");


exports.registerProvider = async (req, res) => {
    console.log("Register Provider API called");
    try {
        const { name, email, password, phone, serviceType } = req.body;

        // Validation
        if (!name || !email || !password || !serviceType) {
            return res.status(400).json({
                message: "Name, Email, Password, and Service Type are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const userExist = await User.findOne({ email: normalizedEmail });
        if (userExist) {
            return res.status(400).json({
                message: "User Already Exists. Please Try With Another Email"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User document
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "provider"
        });

        // Create Provider document
        const provider = await Provider.create({
            userId: user._id,
            name,
            email: normalizedEmail,
            phone: phone || "",
            serviceType,
            
        });

        res.status(201).json({
            message: "Provider Registered Successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            provider: {
                id: provider._id,
                serviceType: provider.serviceType,
                isVerified: provider.isVerified
            }
        });
    } catch (err) {
        console.error("Provider Registration Error:", err);
        res.status(500).json({ 
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.loginProvider = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists and role is Provider
        const user = await User.findOne({ email: normalizedEmail });
        if (!user || user.role !== "provider") {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }

        // Get provider details
        const provider = await Provider.findOne({ userId: user._id });
        if(!provider){
            return res.status(404).json({
                message: "Provider Profile Not Found"
            });
        }
        // Generate tokens
        const refreshToken = generateRefreshToken(user);
        const accessToken = generateAccessToken(user);
        
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: "Provider Login Successfully",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            provider: {
                id: provider._id,
                serviceType: provider.serviceType,
                isVerified: provider.isVerified
            }
        });
    } catch (err) {
        console.error("Provider Login Error:", err);
        res.status(500).json({ 
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.completeProfile = async (req,res) => {
    try{
    const { experience, availability,latitude, longitude } = req.body;

    const userId = req.user._id;

    const provider = await Provider.findOne({ userId     }).populate('userId', 'name email');
    if(!provider){
        return res.status(404).json({ message: "Provider Not Found"});
    }

    // Update provider profile
    if(req.body.experience) provider.experience = experience;
    if(req.body.availability) provider.availability = availability;
    if (latitude && longitude) {
      provider.location = {
        type: "Point",
        coordinates: [longitude, latitude] 
      };
    }
    
    // Verification condition - verified when experience and availability are provided
    if(provider.experience && provider.availability && provider.location?.coordinates?.length === 2){
        provider.isVerified = true;
    }
    
    await provider.save();

    res.json({
        message: "Profile Updated Successfully",
        isVerified: provider.isVerified,
        provider
    })
    console.log("Complete Profile Success:", provider);
}catch(err){
    console.error("Complete Profile Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
}
}

exports.completeWork = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await ServiceRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Request Not Found" });
        }

        if (request.status.toLowerCase() !== "accepted") {
            return res.status(400).json({ message: "Request not accepted" });
        }

        //Prevent duplicate OTP
        if (request.otp && request.otpExpires > Date.now()) {
            return res.status(400).json({
                message: "OTP already generated"
            });
        }

        const otp = generateOTP();

        request.otp = otp;
        request.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        console.log("Generated OTP:", otp); 

        await request.save();

        res.json({
            success: true,
            message: "OTP Generated",
            otp
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.verifyOtpAndComplete = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { otp } = req.body;

        // Validate input
        if (!requestId || !otp) {
            return res.status(400).json({
                message: "Request ID and OTP are required"
            });
        }

        // Ensure OTP is a string
        const otpString = String(otp).trim();

        if (otpString.length !== 6 || !/^\d+$/.test(otpString)) {
            return res.status(400).json({
                message: "OTP must be a 6-digit number"
            });
        }

        const request = await ServiceRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        // Check if request is completed
        if (request.status.toLowerCase() === "completed") {
            return res.status(400).json({
                message: "Request already completed"
            });
        }

        // Check OTP exists
        if (!request.otp) {
            return res.status(400).json({
                message: "OTP not found. Please generate OTP first"
            });
        }

        // Check expiry time
        if (!request.otpExpires || Date.now() > request.otpExpires.getTime()) {
            request.otp = null;
            request.otpExpires = null;
            await request.save();
            return res.status(400).json({
                message: "OTP expired. Please generate a new OTP"
            });
        }

        // Verify OTP match (string comparison)
        if (String(request.otp).trim() !== otpString) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // Success → complete work
        request.status = "completed";
        request.otp = null;
        request.otpExpires = null;
        request.completedAt = new Date();

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Work completed successfully",
            request: {
                id: request._id,
                status: request.status,
                completedAt: request.completedAt
            }
        });

    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

exports.getMyCompletedRequests  = async (req,res) => {
    try{
        const userId = req.user._id;
        if(!userId){
            return res.status(401).json({
                message: "User ID not found in token"
            });
        }
        if(req.user.role !== "provider"){
            return res.status(403).json({
                message: "Access Denied. Only Providers can access this API"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const completedRequests = await ServiceRequest.find({
            providerId: userId,
            status: "completed"
        }) .populate("customerId", "name") // minimal info
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-otp -otpExpires")
        .lean();

        const totalCompleted = await ServiceRequest.countDocuments({
            providerId: userId,
            status: "completed"
        });

        return res.status(200).json({
            success: true,
            totalCompleted,
            page,
            limit,
            data: completedRequests
        });

    }catch(err){
        console.error("Provider Completed Requests Error:", err);
        res.status(500).json({ success: false,message: "Internal Server Errror", error: err.message });
    }
}