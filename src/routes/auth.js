const express = require("express");
const router = express.Router();
const {
    registerCustomer, 
    loginCustomer
} = require("../controllers/authController")
const {verifyToken} = require("../middleware/authMiddleware");

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
})

router.post("/logout",verifyToken,async(req,res) => {
    const userId = req.user.id;
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