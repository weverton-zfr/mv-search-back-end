import express from "express";
import cors from "cors";

import meRoutes from "./routes/me.routes.js";
import register from "./routes/register.routes.js";
import updateProfile from "./routes/profile.routes.js";
import updatePassword from "./routes/profile.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import { startSubscriptionJob } from "./jobs/subscription.job.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api",
  meRoutes,
  register,
  updateProfile,
  updatePassword
);

app.use("/api/payments", paymentRoutes);

startSubscriptionJob();

export default app;