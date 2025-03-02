import jwt from "jsonwebtoken";
import { v4 as generateUUID } from "uuid";
import { hash, compare } from "bcrypt";
import makeDatabase from "./database.js"; // Import the database

const JWT_SECRET = "your_secret_key"; // Replace with a secure environment variable
const saltRounds = 10;

const db = makeDatabase({ isPersistent: true }); // Use LokiJS

export const register = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const existingUser = db.getByUsername(req.body.username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await hash(req.body.password, saltRounds);
  const newUser = db.create({
    id: generateUUID(),
    username: req.body.username,
    password: hashedPassword,
  });

  res.status(201).json({ id: newUser.id, username: newUser.username });
};

export const login = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const user = db.getByUsername(req.body.username); // 🔥 Use LokiJS
  if (!user || !(await compare(req.body.password, user.password))) {
    return res
      .status(401)
      .json({ message: "Invalid username / password combination" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({ token });
};

export const getProfile = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = extractBearerTokenFromAuth(authHeader);

  if (!token) {
    return res.status(401).json({ message: "You are not logged in" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = db.getById(decoded.userId); // 🔥 Use LokiJS
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `Hello! You are currently logged in as ${user.username}!`,
    });
  });
};
export const logout = (req, res) => {
  res.status(204).end();
};
// Helper function
const extractBearerTokenFromAuth = (authorization) => {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.replace("Bearer ", "");
};
