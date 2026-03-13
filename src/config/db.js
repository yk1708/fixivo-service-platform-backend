const mongoose = require("mongoose");

const connectDB = async() => {
    try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Database Connecting Successfully");
    }catch(err){
        console.error("Database Connection Error", err);
        process.exit(1);
    }
}
module.exports(connectDB);