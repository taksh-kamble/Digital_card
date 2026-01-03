import { UserModel } from "../models/userModel.js";
import { SubscriptionModel } from "../models/subscribtionModel.js";

/**
 * Helper to remove undefined keys from an object
 */
const cleanData = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const upsertUser = async (req, res) => {
  try {
    const uid = req.user.uid;

    // 1. Destructure inputs
    const {
      profileUrl,
      fullName,
      designation,
      company,
      bio,
      phone,
      email,
      website,
      linkedin,
      twitter,
      instagram,
      facebook,
    } = req.body;

    // 2. Create a clean object (removes undefined values)
    const userData = cleanData({
      profileUrl,
      fullName,
      designation,
      company,
      bio,
      phone,
      email,
      website,
      linkedin,
      twitter,
      instagram,
      facebook,
    });

    const existingUser = await UserModel.findByUid(uid);

    if (!existingUser) {
      // Create user profile
      const newUser = await UserModel.create(uid, userData);

      // Auto-create FREE subscription
      const newSubscription = await SubscriptionModel.createFree(uid);

      return res.status(201).json({
        newUser: true,
        user: newUser,
        subscription: newSubscription,
      });
    }

    // 3. Update existing user (Pass the clean userData object)
    const updatedUser = await UserModel.update(uid, userData);

    return res.status(200).json({
      newUser: false,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upsert User Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Fetch User Profile
 */
export const getUser = async (req, res) => {
  const uid = req.user.uid;

  const user = await UserModel.findByUid(uid);

  if (!user) {
    return res.status(404).json({
      userExists: false,
      message: "User does not exist",
    });
  }

  res.status(200).json({
    userExists: true,
    user,
  });
};
