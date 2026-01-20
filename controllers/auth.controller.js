const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const admin = require("firebase-admin");

// Initialize Firebase Admin (Only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "crime-management-system-651ab",
  });
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "user",
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "User registered successfully",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user has a password (might be a social-only account)
    if (!user.password) {
      return res.status(401).json({ 
        message: "This account was created using social login. Please use Google or Facebook to sign in." 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      },
    });

    res.json({
      message: "Admin created successfully",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (userId === req.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Check if email already exists (if changing email)
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const { email, name, uid: googleId, picture } = decodedToken;

    // 1. Try to find user by Google ID first
    let user = await prisma.user.findUnique({
      where: { googleId }
    });

    // 2. If not found, try to find by email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link google account
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId }
          });
        }
      }
    }

    // 3. Create if not found
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          googleId,
          password: null, // No password for social login
          role: "user",
        },
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};

exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken, userID, isFirebase } = req.body;
    let email, name, facebookId;

    if (isFirebase) {
      // Verify Firebase ID Token
      const decodedToken = await admin.auth().verifyIdToken(accessToken);
      email = decodedToken.email;
      name = decodedToken.name;
      facebookId = decodedToken.uid; // uid in firebase for FB login
    } else {
      // Verify legacy Facebook token
      const fbResponse = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
      );
      email = fbResponse.data.email;
      name = fbResponse.data.name;
      facebookId = fbResponse.data.id;
    }

    // 1. Try to find user by Facebook ID first
    let user = await prisma.user.findUnique({
      where: { facebookId }
    });

    // 2. If not found, try to find by email (to link account)
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link facebook account to existing email user
        // Ensure this user doesn't already have a DIFFERENT facebookId (unlikely if logic is correct)
        if (!user.facebookId) {
             user = await prisma.user.update({
              where: { id: user.id },
              data: { facebookId }
            });
        }
      }
    }

    // 3. If still not found, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || `${facebookId}@facebook.com`,
          name: name || email?.split('@')[0] || "Facebook User",
          facebookId,
          password: null,
          role: "user",
        },
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Facebook login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Facebook Login Error:", error);
    res.status(500).json({ message: "Facebook login failed", error: error.message });
  }
};
