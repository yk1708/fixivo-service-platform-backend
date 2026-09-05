const mongoose = require("mongoose");
const dns = require("dns");

try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

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