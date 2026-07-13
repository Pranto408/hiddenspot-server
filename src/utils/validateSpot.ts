import { CATEGORIES, DIFFICULTIES } from "../models/Spot";

export interface SpotInput {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  category?: string;
  images?: string[];
  location?: string;
  entryFee?: number;
  bestTimeToVisit?: string;
  difficulty?: string;
}

export const validateSpotInput = (body: SpotInput): string | null => {
  if (!body.title || body.title.trim().length < 3) {
    return "Title is required (min 3 characters)";
  }
  if (!body.shortDescription || body.shortDescription.trim().length < 10) {
    return "Short description is required (min 10 characters)";
  }
  if (!body.fullDescription || body.fullDescription.trim().length < 30) {
    return "Full description is required (min 30 characters)";
  }
  if (!body.category || !CATEGORIES.includes(body.category as any)) {
    return `Category must be one of: ${CATEGORIES.join(", ")}`;
  }
  if (!Array.isArray(body.images) || body.images.length === 0) {
    return "At least one image URL is required";
  }
  if (!body.location || body.location.trim().length < 2) {
    return "Location is required";
  }
  if (body.entryFee === undefined || body.entryFee < 0) {
    return "Entry fee must be 0 or a positive number";
  }
  if (!body.bestTimeToVisit || body.bestTimeToVisit.trim().length < 2) {
    return "Best time to visit is required";
  }
  if (!body.difficulty || !DIFFICULTIES.includes(body.difficulty as any)) {
    return `Difficulty must be one of: ${DIFFICULTIES.join(", ")}`;
  }
  return null; // no errors
};
