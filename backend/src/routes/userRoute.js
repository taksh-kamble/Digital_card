import express from "express";
import {
  registerUser,
  forgotPassword,
  createDigitalCard,
  checkUserStatus,
  getProfile,
} from "../controllers/userController.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

// Public Route
router.post("/forgot-password", forgotPassword);

// Protected Routes (Require Token)
router.post("/check-status", verifyFirebaseToken, checkUserStatus);
router.post("/register", verifyFirebaseToken, registerUser);
router.post("/create-card", verifyFirebaseToken, createDigitalCard);
router.get("/profile", verifyFirebaseToken, getProfile);

export default router;
