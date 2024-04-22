// routes/adminRoutes.js
import express from "express";
const router = express.Router();
import {
  getFarmersCount,
  getRecentActivities,
} from "../controllers/adminControllers";
import { adminGuard } from "../middleware/authMiddleware";

router.get("/farmers-count", adminGuard, getFarmersCount);
router.get("/recent-activities", adminGuard, getRecentActivities);

export default router;
