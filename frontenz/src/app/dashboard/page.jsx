"use client";
// import React, { useState, useEffect } from "react";
// import { Zap, Loader2 } from "lucide-react";
// import Header from "@/components/Header";
// import CardItem from "@/components/CardItem";
// import ProfileModal from "@/components/ProfileModal";
// import ShareModal from "@/components/ShareModal";
// import Sidebar from "@/components/Sidebar";

// const Dashboard = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [selectedCardForShare, setSelectedCardForShare] = useState(null);

//   // Data State
//   const [cards, setCards] = useState([]);
//   const [isCardsLoading, setIsCardsLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [showProfileModal, setShowProfileModal] = useState(false);

//   // Handlers
//   const handleEditClick = (id) => {
//     window.location.href = `/edit/${id}`;
//   };
//   const handleCreateClick = () => {
//     window.location.href = "/create";
//   };
//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   // Initial Fetch
//   useEffect(() => {
//     const fetchData = async () => {
//       // 1. Fetch User Profile
//       try {
//         const userRes = await fetch("/api/users/me");
//         if (userRes.ok) {
//           const userData = await userRes.json();
//           setUser(userData);
//         } else {
//           setShowProfileModal(true);
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         setShowProfileModal(true);
//       }

//       // 2. Fetch Cards
//       try {
//         const cardsRes = await fetch("/api/cards/me");
//         if (cardsRes.ok) {
//           const cardsData = await cardsRes.json();
//           setCards(cardsData);
//         }
//       } catch (error) {
//         console.error("Error fetching cards:", error);
//       } finally {
//         setIsCardsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans relative">
//       <Header onToggleSidebar={toggleSidebar} user={user} />

//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         user={user}
//       />

//       <main className="pt-20 lg:pt-24 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto pb-24">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
//           <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
//             My Digital Cards
//           </h1>
//           <button
//             onClick={handleCreateClick}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
//           >
//             <Zap size={18} /> Create New
//           </button>
//         </div>

//         {isCardsLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
//           </div>
//         ) : cards.length === 0 ? (
//           <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
//             <p className="text-gray-500 mb-4">
//               You haven't created any cards yet.
//             </p>
//             <button
//               onClick={handleCreateClick}
//               className="text-blue-600 font-medium hover:underline"
//             >
//               Create your first card
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {cards.map((card) => (
//               <CardItem
//                 key={card.cardId}
//                 card={card}
//                 onEdit={handleEditClick}
//                 onShare={setSelectedCardForShare}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       <ProfileModal
//         isOpen={showProfileModal}
//         onClose={() => setShowProfileModal(false)}
//         user={user}
//         onSaveSuccess={setUser}
//       />

//       <ShareModal
//         card={selectedCardForShare}
//         onClose={() => setSelectedCardForShare(null)}
//       />

//       <style>{`
//         @keyframes fade-in {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes fade-in-up {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out;
//         }
//         .animate-fade-in-up {
//             animation: fade-in-up 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import {
  Share2,
  Zap,
  Menu,
  X,
  User,
  CreditCard,
  LogOut,
  Download,
  Phone,
  Mail,
  Edit,
  Loader2,
  ChevronRight,
  Check,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Building2,
  Link2,
  Camera,
} from "lucide-react";

// ==========================================
// UTILS & CONSTANTS (src/utils/constants.js)
// ==========================================
const BANNER_IMAGE_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop";

// Logic to determine which image to show based on API data
const getAvatarUrl = (u) => {
  // 1. Priority: User's custom profile URL from API
  if (u?.profileUrl && u.profileUrl.trim() !== "") {
    return u.profileUrl;
  }
  // 2. Fallback: Initials based on Name from API
  if (u?.fullName) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${u.fullName}`;
  }
  // 3. Default: Generic Guest Avatar
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

// ==========================================
// COMPONENT: Header (src/components/Header.jsx)
// ==========================================
const Header = ({ onToggleSidebar, user }) => {
  return (
    <header className="bg-white shadow-sm h-16 fixed w-full top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <div className="text-xl lg:text-2xl font-bold text-blue-600 tracking-tight cursor-pointer">
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
        {/* Optional: Status Indicator */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </button>
    </header>
  );
};

// ==========================================
// COMPONENT: Sidebar (src/components/Sidebar.jsx)
// ==========================================
const SidebarButton = ({ icon, label }) => (
  <button className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-all group">
    <span className="mr-3 text-gray-400 group-hover:text-blue-600 transition-colors">
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ isOpen, onClose, user }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
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
            <div className="relative">
              <img
                src={getAvatarUrl(user)}
                alt="Profile Large"
                className="w-24 h-24 rounded-full border-4 border-blue-50 mb-3 object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mt-2">
              {user?.fullName || "Welcome!"}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-1">
              {user?.email || "user@nexcard.com"}
            </p>
            {user?.designation && (
              <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                {user.designation}
              </span>
            )}
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <SidebarButton icon={<User size={20} />} label="Edit Profile" />
            <SidebarButton
              icon={<CreditCard size={20} />}
              label="Subscription Plan"
            />
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
              <span className="mr-3">
                <LogOut size={20} />
              </span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// ==========================================
// COMPONENT: ProfileModal (src/components/ProfileModal.jsx)
// ==========================================
const ProfileModal = ({ isOpen, onClose, user, onSaveSuccess }) => {
  const [step, setStep] = useState(1); // 1: Necessary, 2: Optional
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

  // Reset or pre-fill on open
  useEffect(() => {
    if (isOpen && user) {
      setFormData((prev) => ({ ...prev, ...user }));
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onSaveSuccess(result.user || formData);
        onClose();
      } else {
        alert("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-3xl flex flex-col md:flex-row min-h-[600px] animate-fade-in-up">
        {/* Left Side: Banner */}
        <div
          className="hidden md:flex md:w-1/2 bg-cover bg-center relative items-end p-10"
          style={{ backgroundImage: `url('${BANNER_IMAGE_URL}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 mb-4 text-blue-200">
              <Sparkles size={24} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Welcome
              </span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Let's get <br /> you setup.
            </h2>
            <p className="text-slate-200 text-lg font-medium">
              Create your profile to start building your digital presence.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 relative flex flex-col bg-white">
          <div className="p-8 pb-4 flex justify-between items-center relative z-10">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
                {step === 1 ? "Essential Details" : "Additional Info"}
              </h3>
              <p className="text-sm text-slate-500">Step {step} of 2</p>
            </div>
            {/* Always show close button for demo purposes */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-800 p-2 bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 w-full">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-6">
            {step === 1 ? (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Profile Photo URL
                  </label>
                  <div className="relative">
                    <Camera
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="profileUrl"
                      value={formData.profileUrl}
                      onChange={handleChange}
                      placeholder="https://your-image-url.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Designation
                    </label>
                    <div className="relative">
                      <Briefcase
                        className="absolute left-3 top-3 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Developer"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Company
                    </label>
                    <div className="relative">
                      <Building2
                        className="absolute left-3 top-3 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Inc."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-3 text-slate-400"
                        size={18}
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Website
                    </label>
                    <div className="relative">
                      <Link2
                        className="absolute left-3 top-3 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="site.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 mt-2">
                    Social Profiles
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Linkedin
                        size={16}
                        className="absolute left-3 top-3 text-blue-700"
                      />
                      <input
                        type="text"
                        name="linkedin"
                        placeholder="LinkedIn"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Twitter
                        size={16}
                        className="absolute left-3 top-3 text-sky-500"
                      />
                      <input
                        type="text"
                        name="twitter"
                        placeholder="Twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Instagram
                        size={16}
                        className="absolute left-3 top-3 text-pink-600"
                      />
                      <input
                        type="text"
                        name="instagram"
                        placeholder="Instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Facebook
                        size={16}
                        className="absolute left-3 top-3 text-blue-600"
                      />
                      <input
                        type="text"
                        name="facebook"
                        placeholder="Facebook"
                        value={formData.facebook}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 pt-0 mt-auto flex justify-between items-center">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 font-semibold text-sm flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}

            <div
              className={`flex gap-3 ${step === 1 ? "w-full justify-end" : ""}`}
            >
              {step === 2 && (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 1) {
                    if (!formData.fullName || !formData.email)
                      return alert("Name and Email are required");
                    setStep(2);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : step === 1 ? (
                  <>
                    Next <ChevronRight size={18} />
                  </>
                ) : (
                  <>
                    Complete <Check size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: ShareModal (src/components/ShareModal.jsx)
// ==========================================
const ShareModal = ({ card, onClose }) => {
  if (!card) return null;

  const handleDownloadQR = () => {
    alert("Downloading QR Code...");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">Share Card</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=nexcard.com/u/${card.cardId}`}
              alt="QR Code"
              className="w-48 h-48"
            />
          </div>

          <h4 className="font-medium text-gray-900 mb-1">{card.fullName}</h4>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Scan to save contact details or share using the options below.
          </p>

          <div className="grid grid-cols-3 gap-4 w-full">
            <a
              href={`https://wa.me/?text=Check out my digital card: nexcard.com/u/${card.cardId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Phone size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">
                WhatsApp
              </span>
            </a>
            <a
              href={`mailto:?subject=My Digital Card&body=Here is my digital business card: nexcard.com/u/${card.cardId}`}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Email</span>
            </a>
            <button
              onClick={handleDownloadQR}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Download size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">
                Download
              </span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">Powered by Nexcard</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: CardItem (src/components/CardItem.jsx)
// ==========================================
const CardItem = ({ card, onEdit, onShare }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="h-24 relative" style={getBannerStyle(card.banner)}>
        <div className="absolute -bottom-8 left-6">
          <img
            src={
              card.profileUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${card.fullName}`
            }
            alt="Profile"
            className="w-16 h-16 rounded-lg border-4 border-white shadow-sm bg-white object-cover"
          />
        </div>
      </div>

      <div className="pt-10 px-6 pb-6">
        <h3 className="text-lg font-bold text-gray-800">{card.fullName}</h3>
        <p className="text-blue-600 font-medium text-sm">{card.designation}</p>
        <p className="text-gray-500 text-sm mt-1">{card.company}</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onEdit(card.cardId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all font-medium text-sm"
          >
            <Edit size={16} /> Edit
          </button>
          <button
            onClick={() => onShare(card)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all font-medium text-sm"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PAGE: Dashboard (src/pages/Dashboard.jsx)
// ==========================================
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCardForShare, setSelectedCardForShare] = useState(null);

  // Data State
  const [cards, setCards] = useState([]);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Handlers
  const handleEditClick = (id) => {
    window.location.href = `/edit/${id}`;
  };
  const handleCreateClick = () => {
    window.location.href = "/create";
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch User Profile
      try {
        const userRes = await fetch("/api/users/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setShowProfileModal(true);
      }

      // 2. Fetch Cards
      try {
        const cardsRes = await fetch("/api/cards/me");
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          setCards(cardsData);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setIsCardsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <Header onToggleSidebar={toggleSidebar} user={user} />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />

      <main className="pt-20 lg:pt-24 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            My Digital Cards
          </h1>
          <button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Zap size={18} /> Create New
          </button>
        </div>

        {isCardsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4">
              You haven't created any cards yet.
            </p>
            <button
              onClick={handleCreateClick}
              className="text-blue-600 font-medium hover:underline"
            >
              Create your first card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CardItem
                key={card.cardId}
                card={card}
                onEdit={handleEditClick}
                onShare={setSelectedCardForShare}
              />
            ))}
          </div>
        )}
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onSaveSuccess={setUser}
      />

      <ShareModal
        card={selectedCardForShare}
        onClose={() => setSelectedCardForShare(null)}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
