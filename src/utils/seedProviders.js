const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Provider = require("../models/Provider");
const connectDB = require("../config/db");
// const client = require("../redis/redis");

const dummyProviders = [
    {
        name: "Alex Johnson",
        email: "alex.plumbing@example.com",
        password: "password123",
        phone: "+19876543210",
        serviceType: "Plumber",
        experience: 7,
        averageRating: 4.8,
        rating: 4.8,
        reviewCount: 24,
        availability: "24/7 Available",
        location: {
            type: "Point",
            coordinates: [72.8777, 19.0760] // [longitude, latitude]
        },
        isVerified: true,
        isAvailable: true
    },
    {
        name: "Sarah Miller",
        email: "sarah.electric@example.com",
        password: "password123",
        phone: "+19876543211",
        serviceType: "Electrician",
        experience: 5,
        averageRating: 4.9,
        rating: 4.9,
        reviewCount: 42,
        availability: "8:00 AM - 8:00 PM",
        location: {
            type: "Point",
            coordinates: [72.8820, 19.0820]
        },
        isVerified: true,
        isAvailable: true
    },
    {
        name: "David Smith",
        email: "david.ac@example.com",
        password: "password123",
        phone: "+19876543212",
        serviceType: "AC Repair",
        experience: 8,
        averageRating: 4.7,
        rating: 4.7,
        reviewCount: 19,
        availability: "9:00 AM - 9:00 PM",
        location: {
            type: "Point",
            coordinates: [72.8650, 19.0700]
        },
        isVerified: true,
        isAvailable: true
    },
    {
        name: "Robert Davis",
        email: "robert.carpenter@example.com",
        password: "password123",
        phone: "+19876543213",
        serviceType: "Carpenter",
        experience: 10,
        averageRating: 4.95,
        rating: 4.95,
        reviewCount: 35,
        availability: "Mon-Sat (9 AM - 6 PM)",
        location: {
            type: "Point",
            coordinates: [72.8900, 19.0900]
        },
        isVerified: true,
        isAvailable: true
    },
    {
        name: "Elena Rostova",
        email: "elena.cleaning@example.com",
        password: "password123",
        phone: "+19876543214",
        serviceType: "House Cleaning",
        experience: 4,
        averageRating: 4.85,
        rating: 4.85,
        reviewCount: 50,
        availability: "7:00 AM - 7:00 PM",
        location: {
            type: "Point",
            coordinates: [72.8700, 19.0750]
        },
        isVerified: true,
        isAvailable: true
    }
];

const seedProviders = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB for Seeding...");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        for (const data of dummyProviders) {
            const normalizedEmail = data.email.toLowerCase().trim();

            // 1. Check or Create User
            let user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                user = await User.create({
                    name: data.name,
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "provider"
                });
                console.log(`Created User: ${user.name} (${user.email})`);
            } else {
                console.log(`User already exists: ${user.email}`);
            }

            // 2. Check or Create Provider Profile
            let provider = await Provider.findOne({ userId: user._id });
            if (!provider) {
                provider = await Provider.create({
                    userId: user._id,
                    name: data.name,
                    email: normalizedEmail,
                    phone: data.phone,
                    serviceType: data.serviceType,
                    experience: data.experience,
                    rating: data.rating,
                    averageRating: data.averageRating,
                    reviewCount: data.reviewCount,
                    availability: data.availability,
                    location: data.location,
                    isVerified: data.isVerified,
                    isAvailable: data.isAvailable
                });
                console.log(`Created Verified Provider Profile: ${provider.name} - ${provider.serviceType}`);
            } else {
                // Update verification & details if profile exists
                provider.isVerified = true;
                provider.experience = data.experience;
                provider.availability = data.availability;
                provider.averageRating = data.averageRating;
                provider.location = data.location;
                await provider.save();
                console.log(`Updated Provider Profile to Verified: ${provider.name}`);
            }
        }

        // Clear Redis cache so GET /api/customer/verified-providers pulls fresh data
        // try {
        //     await client.del("verified-providers:all");
        //     console.log("Redis cache cleared ('verified-providers:all')");
        // } catch (redisErr) {
        //     console.warn("Could not clear Redis cache (Redis might be offline):", redisErr.message);
        // }

        console.log("\n✅ Verified Providers Dummy Data Seeded Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error Seeding Providers:", err);
        process.exit(1);
    }
};

seedProviders();
