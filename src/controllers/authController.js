const User = require("../models/User")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");


exports.registerCustomer = async (req, res) => {
    try{
    const {name,email,password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, Email, and Password are required"
            });
        }
    const userExist = await User.findOne({email});
    if(userExist){
       return res.status(400).json({
            message:"User Already Exist. Please Try With Another Email"
        })}

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const user = await User.create({
        name,
        email,
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

    const user = await User.findOne({email});
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