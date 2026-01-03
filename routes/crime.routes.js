const express = require("express");
const router = express.Router();
const { createCrime, getCrimes, updateCrimeStatus, updateCrime, deleteCrime } = require("../controllers/crime.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, createCrime);
router.get("/", authenticate, getCrimes);
router.patch("/:crimeId/status", authenticate, updateCrimeStatus);
router.patch("/:crimeId", authenticate, updateCrime);
router.delete("/:crimeId", authenticate, deleteCrime);

module.exports = router;
