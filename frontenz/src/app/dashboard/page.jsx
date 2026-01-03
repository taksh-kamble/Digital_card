"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  X,
  User,
  CreditCard,
  LogOut,
  Loader2,
  ExternalLink,
  Edit3,
  Share2,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userAPI, cardAPI, setAuthToken } from "@/lib/api";

// Ensure this path matches where you saved the file above
import ShareModal from "@/components/ShareModal";

// --- UTILS ---
const getAvatarUrl = (u) => {
  if (u?.profileUrl?.trim()) return u.profileUrl;
  if (u?.fullName)
    return `https://api.dicebear.com/7.x/initials/svg?seed=${u.fullName}`;
  return "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
};

const getBannerStyle = (banner) => {
  if (!banner) return { backgroundColor: "#2563EB" };
  if (banner.type === "image") {
    return {
      backgroundImage: `url(${banner.value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: banner.value };
};

// --- COMPONENTS ---

const Header = ({ onToggleSidebar, user }) => {
  const router = useRouter(); // ✅ FIX

  return (
    <header className="bg-white shadow-sm h-16 fixed w-full top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <div
        className="text-xl lg:text-2xl font-bold text-blue-600 tracking-tight cursor-pointer"
        onClick={() => router.push("/")}
      >
        Nexcard
      </div>

      <button
        onClick={onToggleSidebar}
        className="relative focus:outline-none hover:ring-2 hover:ring-blue-100 rounded-full transition-all"
      >
        <img
          src={getAvatarUrl(user)}
          alt="Profile"
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gray-200 object-cover"
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </button>
    </header>
  );
};

const Sidebar = ({ isOpen, onClose, user, onLogout }) => (
  <>
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
    )}
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col items-center px-6 pb-6 border-b border-gray-100">
          <img
            src={getAvatarUrl(user)}
            alt="P"
            className="w-24 h-24 rounded-full border-4 border-blue-50 mb-3 object-cover"
          />
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            {user?.fullName || "Welcome!"}
          </h2>
          <p className="text-sm text-gray-500 text-center">{user?.email}</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
          >
            <User size={20} className="mr-3" />
            Edit Profile
          </button>

          <button
            onClick={() => router.push("/subscription")}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
          >
            <CreditCard size={20} className="mr-3" />
            Subscription
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} className="mr-3" /> Logout
          </button>
        </div>
      </div>
    </aside>
  </>
);

// --- MODALS (ProfileModal) ---
const ProfileModal = ({ isOpen, onClose, user, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    designation: "",
    company: "",
    profileUrl: "",
    bio: "",
    phone: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    if (isOpen && user) setFormData((prev) => ({ ...prev, ...user }));
  }, [isOpen, user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updatedUser = await userAPI.createOrUpdate(formData);
      onSaveSuccess(updatedUser);
      onClose();
    } catch (error) {
      alert("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-3xl flex flex-col md:flex-row min-h-[600px] animate-fade-in-up">
        <div className="hidden md:flex md:w-1/2 bg-blue-600 p-10 text-white items-end">
          <h2 className="text-4xl font-bold">Update your details</h2>
        </div>
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <button onClick={onClose} className="ml-auto mb-4">
            <X />
          </button>
          <div className="flex-1 space-y-4">
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 border rounded-xl"
            />
            <input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Designation"
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white p-3 rounded-xl mt-4 font-bold"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // New State for Share Modal
  const [activeShareCard, setActiveShareCard] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);

        try {
          const [userData, cardsData] = await Promise.all([
            userAPI.getProfile(),
            cardAPI.getMyCards(),
          ]);
          setUser(userData.data);
          setCards(cardsData.data);
        } catch (error) {
          setShowProfileModal(true);
        } finally {
          setIsCardsLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    setAuthToken(null);
    router.push("/");
  };

  const handleCreateClick = () => router.push("/create");

  const handleEditClick = (id) => {
    router.push(`/edit/${id}`);
  };

  const handleOpenPublicCard = (card) => {
    const slug = card.cardLink || card.cardId || card._id;
    window.open(`/p/${slug}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} user={user} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="pt-24 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Digital Cards</h1>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <Zap size={18} /> Create New
          </button>
        </div>

        {isCardsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4 text-lg">
              You haven't created any cards yet.
            </p>
            <button
              onClick={handleCreateClick}
              className="text-blue-600 font-bold hover:underline"
            >
              Get started now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const validId = card.cardId || card._id;

              return (
                <div
                  key={validId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="h-24" style={getBannerStyle(card.banner)} />
                  <div className="p-6 pt-10 relative">
                    <img
                      src={getAvatarUrl(card)}
                      alt="Profile"
                      className="w-16 h-16 rounded-xl absolute -top-8 left-6 border-4 border-white shadow-md object-cover"
                    />
                    <h3 className="text-lg font-bold truncate pr-2">
                      {card.fullName}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium truncate">
                      {card.designation || "No Designation"}
                    </p>

                    {/* BUTTONS SECTION */}
                    <div className="flex gap-2 mt-6">
                      {/* EDIT Button */}
                      <button
                        onClick={() => handleEditClick(validId)}
                        className="flex-1 py-2.5 bg-slate-50 rounded-lg text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit3 size={16} /> Edit
                      </button>

                      {/* SHARE Button */}
                      <button
                        onClick={() => setActiveShareCard(card)}
                        className="flex-1 py-2.5 bg-blue-600 rounded-lg text-sm font-bold border border-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 size={16} /> Share
                      </button>

                      {/* OPEN Button */}
                      <button
                        onClick={() => handleOpenPublicCard(card)}
                        title="Open public card"
                        className="w-12 py-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onSaveSuccess={setUser}
      />

      {/* Render ShareModal */}
      <ShareModal
        card={activeShareCard}
        onClose={() => setActiveShareCard(null)}
      />
    </div>
  );
};

export default Dashboard;
