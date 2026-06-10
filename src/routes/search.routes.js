import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireActivePlan } from "../middleware/plan.middleware.js";
import { searchController } from "../controllers/search.controller.js";


const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requireActivePlan,
  searchController
);

export default router;