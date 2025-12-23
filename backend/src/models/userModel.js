import { db } from "../config/firebase.js";

// --- User Account Operations ---

// Create or Update the main User Document
export async function createUserAccount(userId, data) {
  const userRef = db.collection("users").doc(userId);
  await userRef.set(data, { merge: true });
}

// Get User Data
export async function getUser(userId) {
  const userDoc = await db.collection("users").doc(userId).get();
  return userDoc.exists ? userDoc.data() : null;
}

// --- Digital Card Operations (Sub-collection) ---

// Add a new card to the user's 'digitalCards' sub-collection
export async function addCardToUser(userId, cardData) {
  const cardsRef = db
    .collection("users")
    .doc(userId)
    .collection("digitalCards");
  const newCardRef = cardsRef.doc(); // Auto-generate ID

  await newCardRef.set({
    ...cardData,
    id: newCardRef.id,
    createdAt: new Date().toISOString(),
  });

  return newCardRef.id;
}

// Count how many cards a user has (For Limit Checking)
export async function getCardCount(userId) {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("digitalCards")
    .get();

  return snapshot.size;
}

// Get all cards for a specific user
export async function getUserCards(userId) {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("digitalCards")
    .get();

  return snapshot.docs.map((doc) => doc.data());
}
