import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import { errorHandler, notFound } from "./src/middlewares/errorMiddleware.js";
import authRoutes from "./src/features/auth/authRoutes.js";
import jobRoutes from "./src/features/jobs/jobRoutes.js";
import userRoutes from "./src/features/users/userRoutes.js";
import applicationRoutes from "./src/features/applications/applicationRoutes.js";
import reviewRoutes from "./src/features/reviews/reviewRoutes.js";

// Load env variables FIRST
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reviews", reviewRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("JobberNaukari API is running...");
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});