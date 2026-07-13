import { Request, Response } from "express";
import { getDB } from "../config/db";
import { User, toPublicUser } from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email and password are required" });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    const db = getDB();
    const users = db.collection<User>("users");

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      res
        .status(409)
        .json({ message: "An account with this email already exists" });
      return;
    }

    const hashed = await hashPassword(password);

    const newUser: User = {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "user",
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    newUser._id = result.insertedId;

    const token = generateToken({
      id: newUser._id.toString(),
      role: newUser.role,
    });

    res.status(201).json({ token, user: toPublicUser(newUser) });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Registration failed",
        error: (error as Error).message,
      });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const db = getDB();
    const users = db.collection<User>("users");
    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken({ id: user._id!.toString(), role: user.role });

    res.status(200).json({ token, user: toPublicUser(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Login failed", error: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  res.status(200).json(req.user);
};
