const mongoose = require("mongoose");

const connectDB = async() => {
    try{
    await mongoose.connect(process.env.MONGO_URL,{
        dbName: "fixivo",
    });
    console.log("MongoDB Database Connecting Successfully To :",mongoose.connection.name);
    }catch(err){
        console.error("Database Connection Error", err);
        process.exit(1);
    }
}
module.exports =connectDB;