import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import checkCardLimit from "../middleware/checkCardLimit.js";
import {
  createCard,
  getMyCards,
  updateCard,
  deleteCard,
  getCardByLink,
  getCardById,
} from "../controllers/cardController.js";

const router = express.Router();

// Auth routes
router.post("/", requireAuth, checkCardLimit, createCard);
router.get("/me", requireAuth, getMyCards);
router.get("/:cardId", requireAuth, getCardById);
router.put("/:cardId", requireAuth, updateCard);
router.delete("/:cardId", requireAuth, deleteCard);

// Public route
router.get(/^\/public\/(.+)/, getCardByLink);

export default router;
