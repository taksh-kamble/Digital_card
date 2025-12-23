import admin from "../config/firebase.js";
import {
  createUserAccount,
  getUser,
  addCardToUser,
  getCardCount,
  getUserCards,
} from "../models/userModel.js";

// Subscription Limits Configuration
const PLAN_LIMITS = {
  free: 2,
  premium: 10,
  enterprise: Infinity,
};

// --- 1. Check User Status (Used after Login) ---
export const checkUserStatus = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "UID is required" });

    const user = await getUser(uid);

    if (user) {
      return res
        .status(200)
        .json({ exists: true, message: "User found", user });
    } else {
      return res.status(200).json({ exists: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error checking status" });
  }
};

// --- 2. Register User (Account + First Card) ---
export const registerUser = async (req, res) => {
  try {
    const { uid, email, ...cardDetails } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: "UID and Email are required" });
    }

    // A. Create Base User Account
    const userAccountData = {
      uid,
      email,
      subscription: {
        plan: "free",
        status: "active",
        validUntil: null,
      },
      createdAt: new Date().toISOString(),
    };
    await createUserAccount(uid, userAccountData);

    // B. Create the First Digital Card
    const cardData = transformBodyToCardData(cardDetails);
    await addCardToUser(uid, cardData);

    res.status(201).json({
      message: "User registered and First Card created",
      user: userAccountData,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// --- 3. Create Additional Digital Card (With Limits) ---
export const createDigitalCard = async (req, res) => {
  try {
    const { uid } = req.body;

    // A. Check Subscription Plan
    const user = await getUser(uid);
    if (!user) return res.status(404).json({ error: "User not found" });

    const currentPlan = user.subscription.plan || "free";
    const maxLimit = PLAN_LIMITS[currentPlan];

    // B. Check Current Usage
    const currentCount = await getCardCount(uid);

    if (currentCount >= maxLimit) {
      return res.status(403).json({
        error: `Limit reached. Your ${currentPlan} plan allows max ${maxLimit} cards.`,
      });
    }

    // C. Create Card
    const cardData = transformBodyToCardData(req.body);
    const cardId = await addCardToUser(uid, cardData);

    res.status(201).json({ message: "New Digital Card created", cardId });
  } catch (error) {
    console.error("Create Card Error:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
};

// --- 4. Get Profile (Returns User + All Cards) ---
export const getProfile = async (req, res) => {
  try {
    // req.user.uid comes from the verifyFirebaseToken middleware
    const uid = req.user.uid;

    const userProfile = await getUser(uid);
    const cards = await getUserCards(uid);

    res.status(200).json({
      user: userProfile,
      cards: cards,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
};

// --- 5. Forgot Password ---
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate Link
    const link = await admin.auth().generatePasswordResetLink(email);

    // In production, email this link using nodemailer.
    // Here we return it for testing purposes.
    res.status(200).json({
      message: "Password reset link generated",
      link: link,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "User not found" });
  }
};

// --- Helper: Data Transformer ---
function transformBodyToCardData(body) {
  return {
    personalInfo: {
      fullName: body.fullName,
      dob: body.dob,
      profilePhoto: body.profilePhoto || "", // URL from frontend
    },
    professionalInfo: {
      education: body.education,
      jobPosition: body.jobPosition,
      jobDescription: body.jobDescription,
    },
    socialLinks: body.socialLinks || {}, // JSON object
    roomId: body.roomId,
    isActive: true,
  };
}
