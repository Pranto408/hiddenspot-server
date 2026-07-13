import { Response } from "express";
import { ObjectId, Filter } from "mongodb";
import { getDB } from "../config/db";
import { Spot } from "../models/Spot";
import { validateSpotInput } from "../utils/validateSpot";
import { AuthRequest } from "../middleware/auth";
import { Request } from "express";

const SPOTS_PER_PAGE = 8;

// GET /api/spots - list with search, filter, sort, pagination
export const getSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDB();
    const spots = db.collection<Spot>("spots");

    const {
      search,
      category,
      difficulty,
      sort = "newest",
      page = "1",
    } = req.query as Record<string, string>;

    const filter: Filter<Spot> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category as Spot["category"];
    if (difficulty) filter.difficulty = difficulty as Spot["difficulty"];

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "rating") sortOption = { averageRating: -1 };
    if (sort === "priceLow") sortOption = { entryFee: 1 };
    if (sort === "priceHigh") sortOption = { entryFee: -1 };

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * SPOTS_PER_PAGE;

    const [items, total] = await Promise.all([
      spots
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(SPOTS_PER_PAGE)
        .toArray(),
      spots.countDocuments(filter),
    ]);

    res.status(200).json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / SPOTS_PER_PAGE),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch spots",
        error: (error as Error).message,
      });
  }
};

// GET /api/spots/:id
export const getSpotById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid spot id" });
      return;
    }
    const db = getDB();
    const spot = await db
      .collection<Spot>("spots")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!spot) {
      res.status(404).json({ message: "Spot not found" });
      return;
    }

    // related spots: same category, excluding this one
    const related = await db
      .collection<Spot>("spots")
      .find({ category: spot.category, _id: { $ne: spot._id } })
      .limit(4)
      .toArray();

    res.status(200).json({ spot, related });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch spot",
        error: (error as Error).message,
      });
  }
};

// POST /api/spots (protected)
export const createSpot = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const error = validateSpotInput(req.body);
    if (error) {
      res.status(400).json({ message: error });
      return;
    }
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const db = getDB();
    const newSpot: Spot = {
      title: req.body.title.trim(),
      shortDescription: req.body.shortDescription.trim(),
      fullDescription: req.body.fullDescription.trim(),
      category: req.body.category,
      images: req.body.images,
      location: req.body.location.trim(),
      entryFee: Number(req.body.entryFee),
      bestTimeToVisit: req.body.bestTimeToVisit.trim(),
      difficulty: req.body.difficulty,
      averageRating: 0,
      reviews: [],
      addedBy: new ObjectId(req.user.id),
      addedByName: req.user.name,
      createdAt: new Date(),
    };

    const result = await db.collection<Spot>("spots").insertOne(newSpot);
    newSpot._id = result.insertedId;

    res.status(201).json(newSpot);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to create spot",
        error: (error as Error).message,
      });
  }
};

// GET /api/spots/mine (protected) - for Manage Spots page
export const getMySpots = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    const db = getDB();
    const spots = await db
      .collection<Spot>("spots")
      .find({ addedBy: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(spots);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch your spots",
        error: (error as Error).message,
      });
  }
};

// DELETE /api/spots/:id (protected, owner or admin only)
export const deleteSpot = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid spot id" });
      return;
    }
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const db = getDB();
    const spots = db.collection<Spot>("spots");
    const spot = await spots.findOne({ _id: new ObjectId(req.params.id) });

    if (!spot) {
      res.status(404).json({ message: "Spot not found" });
      return;
    }
    if (spot.addedBy.toString() !== req.user.id && req.user.role !== "admin") {
      res.status(403).json({ message: "You can only delete your own spots" });
      return;
    }

    await spots.deleteOne({ _id: spot._id });
    res.status(200).json({ message: "Spot deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete spot",
        error: (error as Error).message,
      });
  }
};

// POST /api/spots/:id/reviews (protected)
export const addReview = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      res.status(400).json({ message: "Invalid spot id" });
      return;
    }
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5 || !comment) {
      res
        .status(400)
        .json({ message: "Rating (1-5) and comment are required" });
      return;
    }

    const db = getDB();
    const spots = db.collection<Spot>("spots");
    const spot = await spots.findOne({ _id: new ObjectId(req.params.id) });

    if (!spot) {
      res.status(404).json({ message: "Spot not found" });
      return;
    }

    const newReview = {
      user: new ObjectId(req.user.id),
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    };

    const updatedReviews = [...spot.reviews, newReview];
    const averageRating =
      updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
      updatedReviews.length;

    await spots.updateOne(
      { _id: spot._id },
      { $set: { reviews: updatedReviews, averageRating } },
    );

    res.status(201).json({ message: "Review added", averageRating });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to add review",
        error: (error as Error).message,
      });
  }
};
