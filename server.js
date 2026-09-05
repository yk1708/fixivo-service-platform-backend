const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
// require("./src/redis/redis"); // Initialize Redis connection
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
    console.log(`User connected: ${socket.id}`);

    // Store provider socket mapping (providerId -> socketId)
    socket.on("providerOnline", (providerId) => {
        socket.providerId = providerId;
        socket.join(`provider_${providerId}`);
        console.log(`Provider ${providerId} joined room: provider_${providerId}`);
    });

    // Store customer socket mapping (customerId -> socketId)
    socket.on("customerOnline", (customerId) => {
        socket.customerId = customerId;
        socket.join(`customer_${customerId}`);
        console.log(`Customer ${customerId} joined room: customer_${customerId}`);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server Running On ${PORT}`);
});