const User = require("../models/User");
const Provider = require("../models/Provider");
const bcrypt = require("bcryptjs");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");

// Professional/Provider Registration
exports.registerProvider = async (req, res) => {
    try {
        const { name, email, password, phone, serviceType, location } = req.body;

        // Validation
        if (!name || !email || !password || !serviceType) {
            return res.status(400).json({
                message: "Name, Email, Password, and Service Type are required"
            });
        }

        // Check if user already exists
        const userExist = await User.findOne({ email });
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
            email,
            password: hashedPassword,
            role: "professional"
        });

        // Create Provider document
        const provider = await Provider.create({
            userId: user._id,
            name,
            email,
            phone: phone || "",
            serviceType,
            location: location || { type: "Point", coordinates: [0, 0] }
        });

        res.status(201).json({
            message: "Professional Registered Successfully",
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
        res.status(500).json({ error: err.message });
    }
};

// Professional/Provider Login
exports.loginProvider = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and role is professional
        const user = await User.findOne({ email });
        if (!user || user.role !== "professional") {
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

        // Generate tokens
        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);
        
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: "Professional Login Successfully",
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
        res.status(500).json({ error: err.message });
    }
};