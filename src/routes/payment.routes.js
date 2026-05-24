import express from "express";
import {
  createPayment,
  getCheckAndActivate,
  getPaymentStatus,
  createCardPayment
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-payment", authMiddleware, createPayment);

router.post("/create-card-payment", authMiddleware, createCardPayment);

router.post("/payment/:id/confirm", authMiddleware, getCheckAndActivate);

router.get("/payment-status/:id", authMiddleware, getPaymentStatus);

export default router;