const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, isAdmin } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/facebook-login", authController.facebookLogin);
router.get("/profile", authenticate, authController.getProfile);
router.get("/users", authenticate, isAdmin, authController.getAllUsers);
router.patch("/users/:userId/role", authenticate, isAdmin, authController.updateUserRole);
router.patch("/users/:userId", authenticate, isAdmin, authController.updateUser);
router.delete("/users/:userId", authenticate, isAdmin, authController.deleteUser);
router.post("/create-admin", authenticate, isAdmin, authController.createAdmin);

module.exports = router;
