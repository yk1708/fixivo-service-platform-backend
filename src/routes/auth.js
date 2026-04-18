const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
    registerCustomer, 
    loginCustomer
} = require("../controllers/authController")
const {verifyToken} = require("../middleware/authMiddleware");
const {generateAccessToken} = require("../utils/generateToken");

const {
    registerProvider,
    loginProvider
} = require("../controllers/providerController");


router.post("/customer/register", registerCustomer);
router.post("/customer/login", loginCustomer);

router.post("/provider/register", registerProvider);
router.post("/provider/login", loginProvider);



router.post("/refresh-token", async (req,res) => {
    const {refreshToken} = req.body;
    if(!refreshToken){
        return res.status(400).json({
            message:"Refresh Token is Required"
        })
    }   
    
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({
                message: "User Not Found"
            })
        }
        
        // Check if refresh token matches stored token
        if(user.refreshToken !== refreshToken){
            return res.status(403).json({
                message: "Invalid refresh token"
            })
        }
        
        // Generate new access token
        const newAccessToken = generateAccessToken(user);
        
        res.json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });
        
    } catch(err) {
        if(err.name === 'TokenExpiredError'){
            return res.status(403).json({
                message: "Refresh token has expired. Please login again"
            })
        }
        res.status(403).json({
            message: "Invalid or expired token"
        });
    }
})

router.post("/logout",verifyToken,async(req,res) => {
    const userId = req.user._id;
    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User Not Found"
            })
        }
        user.refreshToken = null;
        await user.save();
        res.json({
            message:"User Successfully Logout"
        })
    }catch(err){
        res.status(500).json({error:err.message})
    }
})

module.exports = router;