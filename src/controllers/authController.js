const User = require("../models/User")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");
const { OAuth2Client } = require('google-auth-library');
const Provider = require("../models/Provider");

exports.registerCustomer = async (req, res) => {
    try{
    const {name,email,password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, Email, and Password are required"
            });
        }
    const normalizedEmail = email.toLowerCase().trim();
    const userExist = await User.findOne({email: normalizedEmail});
    if(userExist){
       return res.status(400).json({
            message:"User Already Exist. Please Try With Another Email"
        })}

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const user = await User.create({
        name,
        email: normalizedEmail,
        password:hashedPassword,
        role: "customer"
    })
    res.status(201).json({
        message:"Customer Registered Successfully",
        user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
    }) 
    }catch(err){
        res.status(500).json({ error:err.message})
    }
}

exports.loginCustomer = async (req, res) => {
    try{
    const {email,password} = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({email: normalizedEmail});
            if (!user || user.role !== "customer") {
            return res.status(400).json({
                message: "Invalid Email or Password"
            });
        }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({
            message: "Invalid Email or Password"
        })
    }

const refreshToken = generateRefreshToken(user);
const accessToken = generateAccessToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.json({
        message:"Customer Login Successfully",
        accessToken,
        refreshToken,
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
}

exports.googleLogin = async (req, res) => {
    try {
        const { token, role, serviceType } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Google ID Token is required"
            });
        }

        if (!role || !["customer", "provider"].includes(role)) {
            return res.status(400).json({
                message: "Invalid or missing role"
            });
        }

        // Verify Google ID Token
        let googlePayload;
        try {
            const clientID = process.env.GOOGLE_CLIENT_ID;
            if (!clientID) {
                return res.status(500).json({
                    message: "GOOGLE_CLIENT_ID is not configured in the backend .env file. Please configure it to enable Google OAuth."
                });
            }
            
            const oauth2Client = new OAuth2Client(clientID);
            const ticket = await oauth2Client.verifyIdToken({
                idToken: token,
                audience: clientID,
            });
            googlePayload = ticket.getPayload();
        } catch (verificationError) {
            console.error("Google ID Token Verification Error:", verificationError);
            return res.status(401).json({
                message: "Invalid Google ID Token"
            });
        }

        const { email, name } = googlePayload;
        const normalizedEmail = email.toLowerCase().trim();

        // Find existing user by email
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            // Check if role matches
            if (user.role !== role) {
                return res.status(400).json({
                    message: `This account is already registered as a ${user.role}. Please log in with the correct role.`
                });
            }
        } else {
            // New user signup via Google!
            const crypto = require("crypto");
            const randomPassword = crypto.randomBytes(16).toString("hex");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: role
            });

            // If provider role, create Provider profile
            if (role === "provider") {
                if (!serviceType) {
                    return res.status(400).json({
                        message: "Service Type is required for professional registration"
                    });
                }
                await Provider.create({
                    userId: user._id,
                    name,
                    email: normalizedEmail,
                    serviceType,
                });
            }
        }

        // Find provider profile if applicable
        let provider = null;
        if (user.role === "provider") {
            provider = await Provider.findOne({ userId: user._id });
            if (!provider) {
                provider = await Provider.create({
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    serviceType: serviceType || "General",
                });
            }
        }

        // Generate tokens
        const refreshToken = generateRefreshToken(user);
        const accessToken = generateAccessToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: "Google Authentication Successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...(provider && {
                provider: {
                    id: provider._id,
                    serviceType: provider.serviceType,
                    isVerified: provider.isVerified
                }
            })
        });

    } catch (err) {
        console.error("Google Login Controller Error:", err);
        res.status(500).json({
            message: "Internal Server Error during Google authentication",
            error: err.message
        });
    }
};