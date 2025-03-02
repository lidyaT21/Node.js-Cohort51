import express from "express";
import { register, login, getProfile, logout } from "./users.js";

const app = express();
app.use(express.json());
// Register Endpoint
app.post("/register", register);

// Login Endpoint
app.post("/login", login);

// Get Profile Endpoint
app.get("/profile", getProfile);

// Logout Endpoint
app.post("/logout", logout);

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
