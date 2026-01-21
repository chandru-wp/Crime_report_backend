require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crimeRoutes = require("../routes/crime.routes");
const authRoutes = require("../routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:10000",
      "http://cr-mgt.chandrukannan.me",
      "https://cr-mgt.chandrukannan.me",
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Check if origin is allowed or if it's a render.com subdomain
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Security headers for Firebase Auth popups (relaxed)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // Removed require-corp as it blocks cross-origin resources like images
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/crimes", crimeRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Crime Report API is running",
    env: process.env.NODE_ENV,
    db_status: "checking..."
  });
});

// Database Debug Endpoint
app.get("/api/debug-db", async (req, res) => {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    });
    res.json({ 
      status: "Connected", 
      userCount: users.length, 
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role
      })),
      database_url_set: !!process.env.DATABASE_URL
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Error", 
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
