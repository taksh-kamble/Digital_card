"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  UserPlus,
  Loader2,
} from "lucide-react";

export default function PublicCardPage() {
  const params = useParams();

  // 1. RECONSTRUCT THE LINK
  // Takes ['card', 'fd22...'] and turns it back into "card/fd22..."
  const rawSlug = params?.slug;
  const cardLinkString = Array.isArray(rawSlug) ? rawSlug.join("/") : rawSlug;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cardLinkString) return;

    const fetchCard = async () => {
      try {
        setLoading(true);

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        // 2. FIX: Send Raw Link (Do not encodeURIComponent)
        // Since your backend Regex captures the full path including slashes,
        // we send "card/uuid" literally so it matches the DB string exactly.
        const response = await axios.get(
          `${API_URL}/cards/public/${cardLinkString}`
        );

        // Handle response (your API returns { card: {...} })
        const cardData = response.data.card || response.data;

        if (!cardData) throw new Error("No data found");

        setCard(cardData);
        setError(false);
      } catch (err) {
        console.error("Error fetching card:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardLinkString]);

  // --- HELPERS ---

  const getAvatarUrl = () => {
    if (card?.profileUrl?.trim()) return card.profileUrl;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${
      card?.fullName || "User"
    }`;
  };

  const getLayoutClasses = () => {
    if (!card) return {};
    switch (card.layout) {
      case "modern":
        return {
          container: "text-left",
          headerWrapper: "relative",
          avatarWrapper:
            "relative size-28 rounded-xl border-4 border-white bg-slate-200 overflow-hidden shadow-md -mt-14 z-10 ml-6",
          info: "mt-4 px-6",
          links: "mt-8 px-6 space-y-3 pb-8",
        };
      case "creative":
        return {
          container: "text-center",
          headerWrapper: "relative flex justify-center items-center",
          avatarWrapper:
            "absolute -bottom-16 left-1/2 transform -translate-x-1/2 size-32 rounded-full border-4 border-white/50 backdrop-blur-sm bg-slate-200 overflow-hidden shadow-xl z-10",
          info: "mt-20 px-6",
          links: "mt-8 px-6 space-y-3 pb-8",
        };
      case "minimal":
      default:
        return {
          container: "text-center",
          headerWrapper: "relative",
          avatarWrapper:
            "absolute -bottom-12 left-1/2 transform -translate-x-1/2 size-28 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md",
          info: "mt-16 px-6",
          links: "mt-8 px-6 space-y-3 pb-8",
        };
    }
  };

  const getFontFamily = () => {
    switch (card?.fontStyle) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      default:
        return "font-sans";
    }
  };

  const bannerStyle =
    card?.banner?.type === "image"
      ? {
          backgroundImage: `url(${card.banner.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: card?.banner?.value || "#2563eb" };

  const skinStyle = card?.cardSkin
    ? {
        backgroundImage: `url(${card.cardSkin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : { backgroundColor: "#F3F4F6" };

  // --- ACTIONS ---
  const handleSaveContact = () => {
    if (!card) return;
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${card.fullName}
N:${card.fullName};;;;
ORG:${card.company || ""}
TITLE:${card.designation || ""}
TEL;TYPE=CELL:${card.phone || ""}
EMAIL:${card.email || ""}
URL:${card.website || ""}
NOTE:${card.bio || "Connected via Nexcard"}
END:VCARD`;

    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${card.fullName.replace(" ", "_")}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOADING / ERROR STATES ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Card Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The digital card you are looking for does not exist.
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition"
          >
            Create Your Own
          </a>
        </div>
      </div>
    );
  }

  const layout = getLayoutClasses();
  const fontFamily = getFontFamily();

  return (
    <div
      className={`min-h-screen flex justify-center py-0 md:py-10 transition-colors duration-500 ${fontFamily}`}
      style={skinStyle}
    >
      <div
        className={`w-full max-w-md md:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-screen md:min-h-[800px] flex flex-col relative transition-all duration-300
        ${
          card.layout === "creative"
            ? "bg-white/90 backdrop-blur-sm"
            : "bg-white"
        }
        ${card.cardSkin ? "bg-opacity-95" : ""}
      `}
      >
        {/* HEADER / BANNER */}
        <div
          className={`w-full relative transition-all duration-300 ${
            card.layout === "creative" ? "h-64" : "h-40"
          } ${layout.headerWrapper}`}
          style={bannerStyle}
        >
          {card.banner?.type === "image" && (
            <div className="absolute inset-0 bg-black/10"></div>
          )}

          {/* AVATAR WRAPPER */}
          <div className={layout.avatarWrapper}>
            <img
              src={getAvatarUrl()}
              alt={card.fullName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* PROFILE INFO */}
        <div className={`${layout.container} ${layout.info} relative`}>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {card.fullName}
          </h1>
          <p className="text-blue-600 font-medium text-lg mt-1">
            {card.designation}
          </p>
          <p className="text-slate-500 text-sm font-medium">{card.company}</p>

          {card.bio && (
            <p className="text-slate-600 text-sm leading-relaxed mt-6 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              {card.bio}
            </p>
          )}
        </div>

        {/* LINKS SECTION */}
        <div className={layout.links}>
          {/* Phone */}
          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              className="flex items-center p-3.5 bg-white/60 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer shadow-sm group"
            >
              <div className="size-10 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                <Phone size={20} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Phone
                </p>
                <p className="text-base font-bold text-slate-800 truncate">
                  {card.phone}
                </p>
              </div>
            </a>
          )}

          {/* Email */}
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              className="flex items-center p-3.5 bg-white/60 border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-sm group"
            >
              <div className="size-10 rounded-full bg-red-100/50 flex items-center justify-center text-red-600 mr-4 group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Email
                </p>
                <p className="text-base font-bold text-slate-800 truncate">
                  {card.email}
                </p>
              </div>
            </a>
          )}

          {/* Website */}
          {card.website && (
            <a
              href={
                card.website.startsWith("http")
                  ? card.website
                  : `https://${card.website}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center p-3.5 bg-white/60 border border-slate-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer shadow-sm group"
            >
              <div className="size-10 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-600 mr-4 group-hover:scale-110 transition-transform">
                <Globe size={20} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Website
                </p>
                <p className="text-base font-bold text-slate-800 truncate">
                  {card.website}
                </p>
              </div>
            </a>
          )}

          {/* LinkedIn */}
          {card.linkedin && (
            <a
              href={
                card.linkedin.startsWith("http")
                  ? card.linkedin
                  : `https://${card.linkedin}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center p-3.5 bg-white/60 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer shadow-sm group"
            >
              <div className="size-10 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5] mr-4 group-hover:scale-110 transition-transform">
                <Linkedin size={20} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  LinkedIn
                </p>
                <p className="text-base font-bold text-slate-800 truncate">
                  Connect on LinkedIn
                </p>
              </div>
            </a>
          )}

          {/* Location */}
          <div className="flex items-center p-3.5 bg-white/60 border border-slate-200 rounded-xl shadow-sm">
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-4">
              <MapPin size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Location
              </p>
              <p className="text-base font-bold text-slate-800">Mumbai, IN</p>
            </div>
          </div>

          {/* SAVE CONTACT */}
          <div className="pt-4">
            <button
              onClick={handleSaveContact}
              style={{
                backgroundColor:
                  card.banner?.type === "color" ? card.banner.value : "#2563EB",
                backgroundImage:
                  card.banner?.type === "image"
                    ? `url(${card.banner.value})`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-full py-4 rounded-xl text-white font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {card.banner?.type === "image" && (
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <UserPlus size={20} /> Save Contact
              </span>
            </button>
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="mt-auto px-6 pb-12">
          <div className="flex justify-center gap-5 flex-wrap">
            {card.twitter && (
              <SocialIcon
                href={card.twitter}
                icon={<Twitter size={20} />}
                color="bg-[#1DA1F2]"
              />
            )}
            {card.instagram && (
              <SocialIcon
                href={card.instagram}
                icon={<Instagram size={20} />}
                color="bg-[#E1306C]"
              />
            )}
            {card.facebook && (
              <SocialIcon
                href={card.facebook}
                icon={<Facebook size={20} />}
                color="bg-[#4267B2]"
              />
            )}
          </div>

          <div className="text-center mt-10 border-t border-slate-200/60 pt-6">
            <a
              href="/"
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              Powered by Nexcard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Social Icon Helper
const SocialIcon = ({ href, icon, color }) => {
  const link = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`${color} text-white size-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all`}
    >
      {icon}
    </a>
  );
};
