import admin from "../config/firebaseAdmin.js";

const db = admin.firestore();
const COLLECTION = "subscriptions";

// Define the FREE plan structure
const FREE_PLAN = {
  plan: "FREE",
  maxCards: 5, // limit of 1 card for FREE plan
  cardsCreated: 0,
  features: {
    customTheme: false,
    analytics: false,
    removeBranding: false,
  },
};

export const SubscriptionModel = {
  async findByUid(uid) {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    return doc.exists ? { uid: doc.id, ...doc.data() } : null;
  },

  // ✅ New method to create FREE subscription
  async createFree(uid) {
    const data = {
      uid,
      ...FREE_PLAN,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION).doc(uid).set(data);
    return data; // return the created subscription
  },

  async create(uid, data) {
    await db
      .collection(COLLECTION)
      .doc(uid)
      .set({
        uid,
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  },

  async update(uid, data) {
    await db
      .collection(COLLECTION)
      .doc(uid)
      .update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  },

  async incrementCardCount(uid) {
    await db
      .collection(COLLECTION)
      .doc(uid)
      .update({
        cardsCreated: admin.firestore.FieldValue.increment(1),
      });
  },
};
