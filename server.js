require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const http = require("http");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 5000;
connectDB();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

// Store socket instance globally for use in other modules
app.set("io", io);

// Socket.IO connection handler
io.on("connection", (socket) => {
    console.log(`Provider connected: ${socket.id}`);

    // Store provider socket mapping (providerId -> socketId)
    socket.on("providerOnline", (providerId) => {
        socket.providerId = providerId;
        socket.join(`provider_${providerId}`);
        console.log(`Provider ${providerId} joined room: provider_${providerId}`);
    });

    socket.on("disconnect", () => {
        console.log(`Provider disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server Running On ${PORT}`);
});