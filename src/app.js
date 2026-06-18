import express from "express";
import cors from "cors";

import meRoutes from "./routes/me.routes.js";
import register from "./routes/register.routes.js";
import updateProfile from "./routes/profile.routes.js";
import updatePassword from "./routes/profile.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import searchRoutes from "./routes/search.routes.js";

import { startSubscriptionJob } from "./jobs/subscription.job.js";

const app = express();

app.use(cors({
   origin: [
      "https://www.mvsearch.com.br/",
    ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

app.use(
  "/api",
  meRoutes,
  register,
  updateProfile,
  updatePassword
);

app.use("/api/search", searchRoutes);

app.use("/api/payments", paymentRoutes);

startSubscriptionJob();

export default app;