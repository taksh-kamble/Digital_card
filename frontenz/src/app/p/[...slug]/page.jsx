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
        const response = await axios.get(
          `${API_URL}/cards/public/${cardLinkString}`
        );
        const cardData = response.data.card || response.data;

        if (!cardData) throw new Error("No data found");

        setCard({
          ...cardData,
          banner: cardData.banner || { type: "color", value: "#2563eb" },
          layout: cardData.layout || "minimal",
          fontStyle: cardData.fontStyle || "basic",
        });
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

  // --- BACKGROUND & TEXT COLOR LOGIC ---
  const getStyles = () => {
    if (!card)
      return { skinStyle: {}, textClass: "text-slate-900", bgImage: null };

    const skinValue = card.cardSkin;
    let skinStyle = { backgroundColor: "#ffffff" }; // Default White
    let textClass = "text-slate-900"; // Default Dark Text
    let bgImage = null; // Storing image URL separately for performance

    if (skinValue) {
      // Check if it looks like an image URL (contains http or /)
      const isImage = skinValue.includes("http") || skinValue.includes("/");

      if (isImage) {
        // PERFORMANCE FIX: We do not set background-image here.
        // We set the container to transparent and pass the URL to a fixed div.
        bgImage = skinValue;
        skinStyle = { backgroundColor: "transparent" };
      } else {
        // It is a color (Hex, RGB, or Name)
        skinStyle = { backgroundColor: skinValue };

        // Simple brightness check for Hex codes to set text color
        if (skinValue.startsWith("#")) {
          const hex = skinValue.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          // If brightness is low (dark background), use white text
          if (brightness < 128) {
            textClass = "text-white";
          }
        } else if (skinValue.toLowerCase() === "black") {
          textClass = "text-white";
        }
      }
    }

    const bannerStyle =
      card.banner?.type === "image" && card.banner.value?.startsWith("http")
        ? {
            backgroundImage: `url(${card.banner.value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: card.banner?.value || "#2563eb" };

    return { skinStyle, bannerStyle, textClass, bgImage };
  };

  const { skinStyle, bannerStyle, textClass, bgImage } = getStyles();

  const getLayoutClasses = () => {
    if (!card) return {};
    switch (card.layout) {
      case "corporate":
        return {
          // Changed min-h-screen to min-h-[100dvh] for mobile consistency
          container: "flex flex-col md:flex-row min-h-[100dvh] text-left",
          sidebar:
            "bg-slate-800 w-full md:w-1/3 min-h-[300px] md:h-full relative flex flex-col items-center pt-10 text-white",
          mainContent: "w-full md:w-2/3 h-full p-8 pt-12",
          avatarWrapper:
            "size-32 rounded-full border-4 border-white/20 mb-6 overflow-hidden bg-slate-200",
          info: "mt-0",
          links: "mt-8 space-y-4",
        };
      case "glass":
        return {
          container: `text-center min-h-[100dvh] relative z-10 flex flex-col items-center pt-20 ${
            !card.cardSkin
              ? "bg-gradient-to-br from-indigo-100 to-purple-100"
              : ""
          }`,
          avatarWrapper:
            "size-40 rounded-3xl border border-white/40 shadow-2xl backdrop-blur-md bg-white/20 mb-8 overflow-hidden",
          info: "bg-white/30 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl mx-4 max-w-md w-full",
          links: "mt-8 w-full space-y-4 pb-12",
        };
      case "elegant":
        return {
          // Pure transparent container
          container: `text-center min-h-[100dvh] border-[12px] border-double ${
            textClass.includes("white") ? "border-white/50" : "border-slate-800"
          } m-0 md:m-6 flex flex-col`,
          header: "h-64 relative flex items-end justify-center",
          avatarWrapper: `absolute -bottom-16 left-1/2 transform -translate-x-1/2 size-40 border-2 ${
            textClass.includes("white") ? "border-white" : "border-slate-800"
          } bg-white p-2 shadow-sm z-20 rotate-45`,
          innerAvatar: "w-full h-full object-cover -rotate-45",
          info: "mt-24 px-8",
          links: "mt-12 px-8 space-y-4 pb-12",
        };
      case "modern":
        return {
          container: "text-left min-h-[100dvh]",
          headerWrapper: "relative h-48",
          avatarWrapper:
            "absolute -bottom-14 left-8 size-36 rounded-2xl shadow-lg border-4 border-white bg-slate-200 overflow-hidden z-10",
          info: "mt-24 px-8",
          links: "mt-10 px-8 space-y-4 pb-12",
        };
      case "creative":
        return {
          container: "text-center min-h-[100dvh]",
          headerWrapper: "relative h-56 flex justify-center items-center",
          avatarWrapper:
            "absolute -bottom-20 left-1/2 transform -translate-x-1/2 size-40 rounded-full shadow-2xl border-4 border-white/50 backdrop-blur-sm bg-slate-200 overflow-hidden z-10",
          info: "mt-28 px-8",
          links: "mt-10 px-8 space-y-4 pb-12",
        };
      case "minimal":
      default:
        return {
          container: "text-center min-h-[100dvh]",
          headerWrapper: "relative h-40",
          avatarWrapper:
            "absolute -bottom-16 left-1/2 transform -translate-x-1/2 size-32 rounded-full shadow-lg border-4 border-white bg-slate-200 overflow-hidden",
          info: "mt-24 px-8",
          links: "mt-10 px-8 space-y-4 pb-12",
        };
    }
  };

  const getFontFamily = () => {
    switch (card?.fontStyle) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      case "script":
        return "font-serif italic";
      case "wide":
        return "font-sans tracking-widest uppercase";
      case "bold":
        return "font-sans font-black";
      default:
        return "font-sans";
    }
  };

  const handleSaveContact = () => {
    const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.fullName}\nORG:${
      card.company || ""
    }\nTITLE:${card.designation || ""}\nTEL;TYPE=CELL:${
      card.phone || ""
    }\nEMAIL:${card.email || ""}\nURL:${card.website || ""}\nNOTE:${
      card.bio || "Connected via Nexcard"
    }\nEND:VCARD`;
    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${card.fullName.replace(" ", "_")}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  if (error || !card)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        Card Not Found
      </div>
    );

  const layout = getLayoutClasses();
  const fontFamily = getFontFamily();

  return (
    <div
      // Changed min-h-screen to min-h-[100dvh] for mobile stability
      className={`min-h-[100dvh] relative transition-colors duration-500 ${fontFamily} ${textClass}`}
      style={skinStyle}
    >
      {/* --- HIGH PERFORMANCE BACKGROUND IMAGE --- */}
      {bgImage && (
        <div
          // UPDATES:
          // 1. h-[100dvh]: Ignores mobile address bar resizing, preventing jitter.
          // 2. transform-gpu: Forces hardware acceleration.
          // 3. pointer-events-none: Ensures scrolls pass through to content immediately.
          className="fixed inset-0 z-0 w-full h-[100dvh] transform-gpu pointer-events-none"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            // 4. will-change: Hint to browser to optimize layering
            willChange: "transform",
          }}
        />
      )}

      {/* --- CONTENT WRAPPER --- */}
      {/* relative z-10 ensures content sits ON TOP of the fixed background */}
      <div
        className={`relative z-10 w-full max-w-xl mx-auto shadow-2xl overflow-hidden min-h-[100dvh] flex flex-col transition-all duration-300`}
      >
        {/* --- CORPORATE LAYOUT --- */}
        {card.layout === "corporate" ? (
          <div className={layout.container}>
            <div className={layout.sidebar} style={bannerStyle}>
              <div className={layout.avatarWrapper}>
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-6 text-center text-white/90">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
                  Scan
                </p>
                <div className="size-24 bg-white/10 p-2 mx-auto rounded-xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="size-full bg-white flex items-center justify-center text-[10px] text-slate-900 font-bold">
                    QR CODE
                  </div>
                </div>
              </div>
            </div>
            <div className={layout.mainContent}>
              <h1 className={`text-3xl font-bold leading-tight ${textClass}`}>
                {card.fullName}
              </h1>
              <p className="text-blue-600 font-medium text-lg mt-2 mb-6">
                {card.designation}
              </p>
              <div className="w-16 h-1.5 bg-slate-200 mb-6 rounded-full"></div>
              <p
                className={`text-sm leading-relaxed mb-10 ${
                  textClass === "text-white"
                    ? "text-white/80"
                    : "text-slate-500"
                }`}
              >
                {card.bio}
              </p>
              <div className="space-y-4">
                {card.phone && (
                  <ContactRow
                    icon={<Phone size={18} />}
                    label="Mobile"
                    value={card.phone}
                    onClick={() => window.open(`tel:${card.phone}`)}
                    textColor={textClass}
                  />
                )}
                {card.email && (
                  <ContactRow
                    icon={<Mail size={18} />}
                    label="Email"
                    value={card.email}
                    onClick={() => window.open(`mailto:${card.email}`)}
                    textColor={textClass}
                  />
                )}
                {card.website && (
                  <ContactRow
                    icon={<Globe size={18} />}
                    label="Website"
                    value={card.website}
                    onClick={() =>
                      window.open(
                        card.website.startsWith("http")
                          ? card.website
                          : `https://${card.website}`
                      )
                    }
                    textColor={textClass}
                  />
                )}
              </div>
              <div className="mt-10">
                <SaveBtn
                  onClick={handleSaveContact}
                  color={
                    card.banner?.type === "color"
                      ? card.banner.value
                      : "#1e293b"
                  }
                />
              </div>
              <SocialsRow
                card={card}
                className="justify-center md:justify-start mt-8"
              />
            </div>
          </div>
        ) : card.layout === "glass" ? (
          /* --- GLASS LAYOUT --- */
          <div className={layout.container}>
            {/* For Glass layout with image skin, we add an overlay div. */}
            {bgImage && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-0"></div>
            )}

            <div className="relative z-10 w-full flex flex-col items-center">
              <div className={layout.avatarWrapper}>
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className={layout.info}>
                <h1 className="text-3xl font-bold text-slate-900">
                  {card.fullName}
                </h1>
                <p className="text-lg font-medium text-slate-600 mb-4">
                  {card.designation}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {card.bio}
                </p>
              </div>
              <div className={layout.links}>
                {card.phone && (
                  <GlassLink
                    icon={<Phone size={20} />}
                    value={card.phone}
                    label="Phone"
                    onClick={() => window.open(`tel:${card.phone}`)}
                  />
                )}
                {card.email && (
                  <GlassLink
                    icon={<Mail size={20} />}
                    value={card.email}
                    label="Email"
                    onClick={() => window.open(`mailto:${card.email}`)}
                  />
                )}
                {card.website && (
                  <GlassLink
                    icon={<Globe size={20} />}
                    value={card.website}
                    label="Website"
                    onClick={() =>
                      window.open(
                        card.website.startsWith("http")
                          ? card.website
                          : `https://${card.website}`
                      )
                    }
                  />
                )}

                <div className="pt-6 px-4">
                  <SaveBtn
                    onClick={handleSaveContact}
                    color="#334155"
                    glass={true}
                  />
                </div>
                <SocialsRow card={card} className="justify-center mt-6" />
              </div>
            </div>
          </div>
        ) : (
          /* --- STANDARD & ELEGANT LAYOUTS --- */
          <div className={layout.container}>
            {card.layout !== "elegant" && (
              <div
                className={`${layout.headerWrapper} w-full transition-all duration-300`}
                style={bannerStyle}
              >
                {card.banner?.type === "image" && (
                  <div className="absolute inset-0 bg-black/10"></div>
                )}
                <div className={layout.avatarWrapper}>
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="h-full w-full object-cover block"
                  />
                </div>
              </div>
            )}

            {card.layout === "elegant" && (
              <>
                <div className={layout.header} style={bannerStyle}>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80"></div>
                </div>
                <div className="relative w-full">
                  <div className={layout.avatarWrapper}>
                    <div className={layout.innerAvatar}>
                      <img
                        src={getAvatarUrl()}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={layout.info}>
              <h1 className={`text-3xl font-bold leading-tight ${textClass}`}>
                {card.fullName}
              </h1>
              <p
                className={`font-medium text-xl mt-2 ${
                  textClass === "text-white" ? "text-blue-300" : "text-blue-600"
                }`}
              >
                {card.designation}
              </p>
              <p
                className={`text-sm font-medium ${
                  textClass === "text-white"
                    ? "text-white/70"
                    : "text-slate-500"
                }`}
              >
                {card.company}
              </p>
              {card.bio && (
                <p
                  className={`text-sm leading-relaxed mt-6 p-6 rounded-2xl border ${
                    textClass === "text-white"
                      ? "bg-white/10 border-white/20 text-white/90"
                      : "bg-slate-50/80 border-slate-100 text-slate-600"
                  }`}
                >
                  {card.bio}
                </p>
              )}
            </div>

            <div className={layout.links}>
              {card.phone && (
                <StandardLink
                  icon={<Phone size={20} />}
                  label="Phone"
                  value={card.phone}
                  href={`tel:${card.phone}`}
                  color="text-blue-600"
                  bg="bg-blue-50"
                  border="hover:border-blue-200"
                />
              )}
              {card.email && (
                <StandardLink
                  icon={<Mail size={20} />}
                  label="Email"
                  value={card.email}
                  href={`mailto:${card.email}`}
                  color="text-red-600"
                  bg="bg-red-50"
                  border="hover:border-red-200"
                />
              )}
              {card.website && (
                <StandardLink
                  icon={<Globe size={20} />}
                  label="Website"
                  value={card.website}
                  href={
                    card.website.startsWith("http")
                      ? card.website
                      : `https://${card.website}`
                  }
                  color="text-purple-600"
                  bg="bg-purple-50"
                  border="hover:border-purple-200"
                />
              )}
              {card.linkedin && (
                <StandardLink
                  icon={<Linkedin size={20} />}
                  label="LinkedIn"
                  value="Connect"
                  href={
                    card.linkedin.startsWith("http")
                      ? card.linkedin
                      : `https://${card.linkedin}`
                  }
                  color="text-[#0077b5]"
                  bg="bg-[#0077b5]/10"
                  border="hover:border-blue-200"
                />
              )}

              <div className="pt-6">
                <SaveBtn
                  onClick={handleSaveContact}
                  color={
                    card.banner?.type === "color"
                      ? card.banner.value
                      : "#2563EB"
                  }
                  bannerImage={
                    card.banner?.type === "image" ? card.banner.value : null
                  }
                />
              </div>
              <SocialsRow card={card} className="justify-center mt-10 pb-8" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const SaveBtn = ({ onClick, color, glass, bannerImage }) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: glass ? "rgba(30,41,59,0.9)" : color,
      backgroundImage: bannerImage ? `url(${bannerImage})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
    className={`w-full py-4 rounded-xl text-white font-bold shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
      glass ? "backdrop-blur-md border border-white/20" : ""
    }`}
  >
    {bannerImage && (
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
    )}
    <span className="relative z-10 flex items-center gap-2">
      <UserPlus size={20} /> Save Contact
    </span>
  </button>
);

const ContactRow = ({ icon, label, value, onClick, textColor }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group"
  >
    <div
      className={`transition-colors ${
        textColor === "text-white"
          ? "text-white/70 group-hover:text-white"
          : "text-slate-400 group-hover:text-blue-600"
      }`}
    >
      {icon}
    </div>
    <div className="text-sm truncate w-full">
      <span
        className={`font-bold block text-xs uppercase tracking-wide opacity-70 ${textColor}`}
      >
        {label}
      </span>
      <span className={`font-medium truncate block ${textColor}`}>{value}</span>
    </div>
  </div>
);

const GlassLink = ({ icon, value, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center p-4 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm hover:bg-white/60 transition-all cursor-pointer mx-4 mb-3"
  >
    <div className="size-10 rounded-full bg-white/60 flex items-center justify-center text-slate-700 mr-4 shrink-0">
      {icon}
    </div>
    <div className="text-left overflow-hidden min-w-0">
      <p className="text-[10px] text-slate-600 uppercase font-bold opacity-70">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);

const StandardLink = ({ icon, label, value, href, color, bg, border }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={`flex items-center p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl hover:bg-white ${border} transition-all cursor-pointer shadow-sm group mb-3`}
  >
    <div
      className={`size-12 rounded-full ${bg} flex items-center justify-center ${color} mr-4 group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
    <div className="text-left overflow-hidden">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-base font-bold text-slate-800 truncate">{value}</p>
    </div>
  </a>
);

const SocialsRow = ({ card, className = "" }) => (
  <div className={`flex gap-4 flex-wrap ${className}`}>
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
);

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
