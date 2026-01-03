import { SubscriptionModel } from "../models/subscribtionModel.js";

const checkCardLimit = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    let sub = await SubscriptionModel.findByUid(uid);

    // Create FREE subscription if not exists
    if (!sub) {
      sub = await SubscriptionModel.createFree(uid);
    }

    // FREE plan is always active
    const isActive = true;

    if (!isActive) {
      return res
        .status(403)
        .json({ message: "Subscription is inactive or expired." });
    }

    // Check card limit
    if (sub.maxCards !== "unlimited" && sub.cardsCreated >= sub.maxCards) {
      return res.status(403).json({
        message: `Card limit reached (${sub.cardsCreated}/${sub.maxCards}). Upgrade to create more.`,
      });
    }

    next();
  } catch (error) {
    console.error("Check Card Limit Error:", error);
    res.status(500).json({ message: "Server error validating subscription." });
  }
};

export default checkCardLimit;
