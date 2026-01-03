require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crimeRoutes = require("../routes/crime.routes");
const authRoutes = require("../routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/crimes", crimeRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Crime Report API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
