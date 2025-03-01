import jwt from "jsonwebtoken";
import { v4 as generateUUID } from "uuid";
import { hash, compare } from "bcrypt";
import newDatabase from "./database.js";

const isPersistent = false;
const database = newDatabase({ isPersistent });

const JWT_SECRET = "your_secret_key";
const saltRounds = 10;

const usersDatabase = database.getUsers();

export const register = async (req, res) => {
  // Check request body
  if (!req.body.username || !req.body.password) {
    res
      .status(400)
      .json({ message: "Please provide username and password" })
      .end();
    return;
  }

  // Check if username already exists
  const isUsernameExists = getUserByUsername(req.body.username) !== undefined;
  if (isUsernameExists) {
    res.status(400).json({ message: "Username already exists" }).end();
    return;
  }

  // Hash the password and create new user
  const hashedPassword = await hash(req.body.password, saltRounds);
  const newUser = {
    id: generateUUID(),
    username: req.body.username,
    password: hashedPassword,
  };

  // Save user to usersDatabase
  database.addUser(newUser);

  // Return success and the new user to the client
  res
    .status(201)
    .json({
      id: newUser.id,
      username: newUser.username,
    })
    .end();
};

export const login = async (req, res) => {
  // Check request body
  if (!req.body.username || !req.body.password) {
    res
      .status(400)
      .json({ message: "Please provide username and password" })
      .end();
    return;
  }

  // Find user in the database
  const user = getUserByUsername(req.body.username);
  if (!user) {
    res
      .status(401)
      .json({ message: "Invalid username / password combination" })
      .end();
    return;
  }

  // Check if password is correct by using bcrypt compare
  const isPasswordCorrect = await compare(req.body.password, user.password);
  if (!isPasswordCorrect) {
    res
      .status(401)
      .json({ message: "Invalid username / password combination" })
      .end();
    return;
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

  // Return the token to the client
  res.status(200).json({ token }).end();
};

export const getProfile = (req, res) => {
  // Check if user is logged in
  const authHeader = req.headers.authorization;
  const token = extractBearerTokenFromAuth(authHeader);

  if (!token) {
    res.status(401).json({ message: "You are not logged in" }).end();
    return;
  }

  // Verify JWT token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Invalid token" }).end();
      return;
    }

    const user = getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "User not found" }).end();
      return;
    }

    // Return user profile
    res
      .status(200)
      .json({
        message: `Hello! You are currently logged in as ${user.username}!`,
      })
      .end();
  });
};

export const logout = (req, res) => {
  // No need to track sessions with JWT
  res.status(204).end();
};

// Helper functions
const getUserByUsername = (username) => {
  return usersDatabase.find((user) => user.username === username);
};

const getUserById = (userID) => {
  return usersDatabase.find((user) => user.id === userID);
};

const extractBearerTokenFromAuth = (authorization) => {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.replace("Bearer ", "");
};
