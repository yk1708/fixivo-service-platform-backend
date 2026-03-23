const express = require("express");
const cors = require("cors");
const app = express();

const auth = require("./routes/auth");
const errorMiddleware = require("./middleware/errorMiddleware");
//Middleware
app.use(express.json())
app.use(cors({
    origin: "*",
    credentials: true
}))
// Routes
app.get("/",(req,res) => {
    res.send("Its Working")
})

app.use("/auth",auth);

app.use(errorMiddleware);
module.exports = app;
