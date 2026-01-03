import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to attach the token to all future requests
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// --- API CATEGORIES ---
export const userAPI = {
  createOrUpdate: (userData) => API.post("/users", userData),
  getProfile: () => API.get("/users/me"),
};

export const subscriptionAPI = {
  getCurrentSubscription: async () => {
    // FIX: Changed 'api' to 'API' to match your instance
    const response = await API.get("/subscription");
    return response.data;
  },
  selectPlan: async (data) => {
    // data = { planId: 'pro' }
    // FIX: Changed 'api' to 'API'
    const response = await API.post("/subscription/select", data);
    return response.data;
  },
  confirmPayment: async (data) => {
    // FIX: Changed 'api' to 'API'
    const response = await API.post("/subscription/confirm-payment", data);
    return response.data;
  },
};

export const cardAPI = {
  createCard: (cardData) => API.post("/cards", cardData),
  getMyCards: () => API.get("/cards/me"),

  // --- ADD THIS FUNCTION ---
  getCardById: async (cardId) => {
    const response = await API.get(`/cards/${cardId}`);
    return response.data;
  },
  // ------------------------

  updateCard: (cardId, updateData) => API.put(`/cards/${cardId}`, updateData),
  deleteCard: (cardId) => API.delete(`/cards/${cardId}`),
  getPublicCard: (cardLink) => API.get(`/cards/public/${cardLink}`),
};

export default API;
