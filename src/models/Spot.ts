import { ObjectId } from "mongodb";

export type SpotCategory =
  | "Viewpoint"
  | "Cafe"
  | "Park"
  | "Heritage"
  | "Rooftop"
  | "Street Food"
  | "Lake";

export type Difficulty = "Easy" | "Moderate" | "Challenging";

export interface Review {
  user: ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Spot {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: SpotCategory;
  images: string[];
  location: string;
  entryFee: number;
  bestTimeToVisit: string;
  difficulty: Difficulty;
  averageRating: number;
  reviews: Review[];
  addedBy: ObjectId;
  addedByName: string;
  createdAt: Date;
}

export const CATEGORIES: SpotCategory[] = [
  "Viewpoint",
  "Cafe",
  "Park",
  "Heritage",
  "Rooftop",
  "Street Food",
  "Lake",
];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Moderate", "Challenging"];
