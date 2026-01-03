import { CardModel } from "../models/cardModel.js";
import { SubscriptionModel } from "../models/subscribtionModel.js";
import { validateCardFeatures } from "../utils/cardFeatureGaurd.js";

// --- HELPER: Remove undefined values ---
const cleanData = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Create Digital Card
 */
export const createCard = async (req, res) => {
  try {
    const uid = req.user.uid;
    const subscription = await SubscriptionModel.findByUid(uid);

    if (!subscription) {
      return res.status(403).json({
        message: "No active subscription found for this user",
      });
    }

    const cardData = cleanData(req.body);

    const error = validateCardFeatures(subscription, cardData);
    if (error) return res.status(403).json({ message: error });

    const card = await CardModel.create(uid, cardData);
    await SubscriptionModel.incrementCardCount(uid);

    res.status(201).json(card);
  } catch (err) {
    console.error("Create Card Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch my cards
 */
export const getMyCards = async (req, res) => {
  try {
    const cards = await CardModel.findByOwner(req.user.uid);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- NEW FUNCTION ADDED HERE ---
/**
 * Fetch single card by ID (For Edit Page)
 */
// src/controllers/cardController.js

export const getCardById = async (req, res) => {
  try {
    const { cardId } = req.params;
    const uid = req.user.uid;

    const card = await CardModel.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Ownership check (VERY IMPORTANT)
    if (card.ownerUid !== uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(card);
  } catch (err) {
    console.error("Get card error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// -------------------------------

/**
 * Update card
 */
export const updateCard = async (req, res) => {
  try {
    const updateData = cleanData(req.body);

    const success = await CardModel.update(
      req.params.cardId,
      req.user.uid,
      updateData
    );

    if (!success) return res.status(404).json({ message: "Card not found" });

    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete card
 */
export const deleteCard = async (req, res) => {
  try {
    const success = await CardModel.delete(req.params.cardId, req.user.uid);

    if (!success) return res.status(404).json({ message: "Card not found" });

    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Public card fetch
 */
export const getCardByLink = async (req, res) => {
  try {
    // With regex routes, the capture group is at index 0
    const cardLink = req.params[0];

    console.log("Fetching public card:", cardLink); // Debug log

    if (!cardLink) {
      return res.status(404).json({ message: "No link provided" });
    }

    const card = await CardModel.findByLink(cardLink);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Return object structure expected by frontend
    res.json({ card });
  } catch (err) {
    console.error("Public Fetch Error:", err);
    res.status(500).json({ message: err.message });
  }
};
