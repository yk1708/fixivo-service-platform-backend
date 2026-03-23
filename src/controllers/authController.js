const User = require("../models/User")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");


exports.register = async (req, res) => {
    try{
    const {name,email,password} = req.body;
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
        password:hashedPassword
    })
    res.status(201).json({
        message:"User Register Successfully",
        user
    }) 
    }catch(err){
        res.status(500).json({ error:err.message})
    }
}

exports.login = async (req, res) => {
    try{
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({
            message: "Invalid User and Password"
        })
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({
            message: "Invalid Email or Password"
        })
    }

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);

    res.json({
        message:"User Successfully Login",
        accessToken,
        refreshToken,
        user
    })
    user.refreshToken = refreshToken;
    await user.save();
    }
    catch(err){
        res.status(500).json({error:err.message})
    }
}