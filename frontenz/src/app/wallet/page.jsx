"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Make sure to install axios: npm install axios
import {
  Wallet,
  ExternalLink,
  Clock,
  Search,
  Loader2,
  User,
  Briefcase,
  MapPin,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// --- 1. SETUP AXIOS (Move this to @/lib/api.js in a real app) ---
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to set headers
const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};
// -------------------------------------------------------------

export default function WalletPage() {
  const router = useRouter();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true); // New state to prevent premature redirects
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 2. USE FIREBASE LISTENER Instead of localStorage
    // This ensures we always have a valid, non-expired token.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
          setAuthChecking(false);
          fetchWallet(); // Fetch data only after we have the token
        } catch (e) {
          console.error("Error getting token", e);
          setAuthChecking(false);
        }
      } else {
        // No user logged in
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchWallet = async () => {
    try {
      setLoading(true);

      // A. Get the list of scanned cards
      const listResponse = await API.get("api/scanned/me");
      const scannedItems = listResponse.data.scannedCards || [];

      // B. Fetch details (Consider moving this logic to Backend to speed this up!)
      const results = await Promise.all(
        scannedItems.map(async (item) => {
          try {
            const detailResponse = await API.get("api/scanned/me", {
              params: { cardLink: item.cardLink },
            });

            if (!detailResponse.data.card) return null;

            return {
              ...detailResponse.data.card,
              scannedAt: item.scannedAt,
              cardLink: item.cardLink,
            };
          } catch (innerErr) {
            console.warn(`Failed to load card: ${item.cardLink}`, innerErr);
            return null;
          }
        })
      );

      const validCards = results
        .filter(Boolean)
        .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));

      setCards(validCards);
      setError(null);
    } catch (err) {
      console.error("Wallet Fetch Error:", err);
      // Optional: Don't show error if it's just an empty list issue
      setError("Could not load your wallet.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    // Handle Firestore Timestamp or standard Date string
    const date = timestamp._seconds 
      ? new Date(timestamp._seconds * 1000) 
      : new Date(timestamp);
      
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getBannerStyle = (card) => {
    if (card.banner?.type === "image" && card.banner.value) {
      return {
        backgroundImage: `url(${card.banner.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    const color = card.banner?.value || card.accentColor || "#4f46e5";
    return {
      background: `linear-gradient(135deg, ${color}, ${adjustBrightness(color, -40)})`, // Darker gradient looks better usually
    };
  };

  const adjustBrightness = (col, amt) => {
    // (Your existing function is fine, keeping it brief here)
    let usePound = false;
    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  };

  // --- UI ---
  
  // 4. Loading State for Auth
  // Prevents the "Flash of Content" before redirecting
  if (authChecking) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
     );
  }

  // --- FILTERING ---
  const filteredCards = cards.filter(
    (card) =>
      card.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm h-16 fixed w-full top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        <div
          onClick={() => router.push("/dashboard")}
          className="text-xl lg:text-2xl font-bold text-blue-600 tracking-tight cursor-pointer"
        >
          Nexcard
        </div>
        <div className="relative">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
             {/* Use auth.currentUser photo if available */}
            {auth.currentUser?.photoURL ? (
                <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        {/* ... Rest of your JSX is fine ... */}
        {/* Just ensure filteredCards mapping renders correctly */}
        
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-500 mt-1">
              Manage the digital cards you've collected.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500">Syncing your wallet...</p>
          </div>
        ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
             <p className="text-red-600 font-medium mb-2">{error}</p>
             <button onClick={fetchWallet} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Try Again</button>
            </div>
        ) : filteredCards.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Wallet className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900">Your wallet is empty</h3>
             <p className="text-gray-500 mt-2 max-w-sm mx-auto">
               {searchTerm ? "No cards match your search." : "Scan a digital card QR code to add it to your wallet."}
             </p>
             {searchTerm && (
               <button onClick={() => setSearchTerm("")} className="mt-4 text-indigo-600 font-medium text-sm">Clear search</button>
             )}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card, index) => (
              <div key={`${card.cardLink}-${index}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="h-24 w-full relative" style={getBannerStyle(card)}>
                  <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatDate(card.scannedAt)}
                  </div>
                </div>
                <div className="px-6 pb-6 flex-grow flex flex-col relative">
                  <div className="-mt-10 mb-3">
                    {card.profileUrl ? (
                      <img src={card.profileUrl} alt={card.fullName} className="w-20 h-20 rounded-xl border-4 border-white shadow-md object-cover bg-white" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gray-100 flex items-center justify-center text-gray-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{card.fullName || "Unnamed Card"}</h3>
                    {(card.designation || card.company) && (
                      <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mt-1 mb-2">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {card.designation}
                          {card.designation && card.company && " • "}
                          {card.company}
                        </span>
                      </div>
                    )}
                    {card.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{card.location}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{card.bio || "No bio available."}</p>
                  </div>
                  <div className="pt-5 mt-4 border-t border-gray-100 flex gap-3">
                    <a href={`/p/${card.cardLink}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                      View Card
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
