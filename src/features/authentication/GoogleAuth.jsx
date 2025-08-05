const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User"); // Adjust path to your User model

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/auth/google-signin", async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name } = payload;

    // Check if user exists in your database, or create a new user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        googleId,
        email,
        name,
        // Add other fields as needed
      });
      await user.save();
    }

    // Generate your application's access and refresh tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error("Google Sign-In error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  
});

module.exports = router;
