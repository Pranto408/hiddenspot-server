import { ObjectId } from "mongodb";

export type UserRole = "user" | "admin";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  createdAt: Date;
}

// Shape we send back to the client (never send password!)
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const toPublicUser = (user: User): PublicUser => ({
  id: user._id!.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});
