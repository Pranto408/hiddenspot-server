import { Router } from "express";
import {
  getSpots,
  getSpotById,
  createSpot,
  getMySpots,
  deleteSpot,
  addReview,
} from "../controllers/spotController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getSpots);
router.get("/mine", protect, getMySpots); // must be BEFORE "/:id"
router.get("/:id", getSpotById);
router.post("/", protect, createSpot);
router.delete("/:id", protect, deleteSpot);
router.post("/:id/reviews", protect, addReview);

export default router;
