"use client";

import React from "react";
import { Smartphone, Linkedin, Mail, Phone, Globe } from "lucide-react";

export const CardPreview = ({ data }) => {
  // --- FIX: Safe Avatar Logic ---
  // If profileUrl is empty, generate a default avatar based on their name
  const displayAvatar = data.profileUrl?.trim()
    ? data.profileUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${
        data.fullName || "User"
      }`;

  // Styles based on layout
  const getLayoutClasses = () => {
    switch (data.layout) {
      case "modern":
        return {
          container: "text-left",
          header: "flex items-end px-6 pb-4 gap-4",
          avatarWrapper:
            "relative size-24 rounded-xl border-4 border-white bg-slate-200 overflow-hidden shadow-md -mb-12 z-10",
          info: "mt-16 px-6",
          actions: "mt-6 px-6 flex gap-3",
          links: "mt-8 px-6 space-y-3 pb-8",
        };
      case "creative":
        return {
          container: "text-center",
          header: "relative flex justify-center items-center h-48",
          avatarWrapper:
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-32 rounded-full border-4 border-white/50 backdrop-blur-sm bg-slate-200 overflow-hidden shadow-xl z-10",
          info: "mt-8 px-6",
          actions: "mt-6 px-6 flex justify-center gap-3",
          links: "mt-8 px-6 space-y-3 pb-8",
        };
      case "minimal":
      default:
        return {
          container: "text-center",
          header: "relative h-32 w-full",
          avatarWrapper:
            "absolute -bottom-12 left-1/2 transform -translate-x-1/2 size-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md",
          info: "mt-14 px-6",
          actions: "mt-6 px-6 flex justify-center gap-3",
          links: "mt-8 px-6 space-y-3 pb-8",
        };
    }
  };

  // Styles based on Font
  const getFontFamily = () => {
    switch (data.fontStyle) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      case "basic":
      default:
        return "font-sans";
    }
  };

  const layout = getLayoutClasses();
  const fontFamily = getFontFamily();

  // Banner Style
  const bannerStyle =
    data.banner?.type === "image"
      ? {
          backgroundImage: `url(${data.banner.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: data.banner?.value || "#2563eb" };

  // Skin Style (Background of the whole card content)
  const skinStyle = data.cardSkin
    ? {
        backgroundImage: `url(${data.cardSkin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: "white" };

  return (
    <div className="relative group perspective-1000 scale-[0.8] sm:scale-90 md:scale-100 origin-top">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* Phone Mockup Container */}
      <div className="relative mx-auto border-slate-900 bg-slate-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden transition-transform duration-500 group-hover:rotate-1 group-hover:scale-[1.01]">
        {/* Notch */}
        <div className="h-[32px] bg-slate-900 w-full absolute top-0 left-0 z-20 flex justify-center">
          <div className="h-[18px] w-[120px] bg-black rounded-b-2xl"></div>
        </div>

        {/* Screen Content */}
        <div
          className={`flex-1 overflow-y-auto hide-scrollbar relative z-10 ${fontFamily}`}
          style={skinStyle}
        >
          {/* Content Wrapper for Skins */}
          <div
            className={`min-h-full ${
              data.layout === "creative" ? "bg-white/80" : "bg-white"
            } ${data.cardSkin ? "bg-opacity-90" : ""}`}
          >
            {/* Header / Cover */}
            <div
              className={`${
                data.layout === "modern"
                  ? "h-32"
                  : data.layout === "creative"
                  ? "h-48"
                  : "h-32"
              } w-full transition-all duration-300`}
              style={bannerStyle}
            >
              {(data.layout === "minimal" || data.layout === "creative") && (
                <div className={layout.header}>
                  <div className={layout.avatarWrapper}>
                    <img
                      src={displayAvatar} // <--- FIXED HERE
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modern Layout Avatar Placement */}
            {data.layout === "modern" && (
              <div className="-mt-12 px-6 mb-4">
                <div className="size-24 rounded-xl border-4 border-white bg-slate-200 overflow-hidden shadow-md">
                  <img
                    src={displayAvatar} // <--- FIXED HERE
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Profile Info */}
            <div className={`${layout.container} ${layout.info}`}>
              <h3 className="text-xl font-bold text-slate-900">
                {data.fullName || "Your Name"}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {data.designation || "Job Title"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {data.company || "Company Name"}
              </p>

              <p className="text-sm text-slate-600 mt-4 leading-relaxed line-clamp-3">
                {data.bio || "Brief bio goes here."}
              </p>
            </div>

            {/* Links Section */}
            <div className={layout.links}>
              {/* Phone */}
              <div className="flex items-center p-3 bg-white/80 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
                <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                  <Phone size={16} />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {data.phone || "+1 234 567 890"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center p-3 bg-white/80 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
                <div className="size-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 mr-3">
                  <Mail size={16} />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {data.email || "hello@example.com"}
                  </p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center p-3 bg-white/80 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
                <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                  <Globe size={16} />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs text-slate-500">Website</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {data.website || "www.mysite.com"}
                  </p>
                </div>
              </div>

              {/* LinkedIn (Conditional) */}
              {data.linkedin && (
                <div className="flex items-center p-3 bg-white/80 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
                  <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 mr-3">
                    <Linkedin size={16} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs text-slate-500">LinkedIn</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      Connect
                    </p>
                  </div>
                </div>
              )}

              {/* Save Contact Button */}
              <div className="pt-4 pb-4">
                <button
                  style={{
                    backgroundColor:
                      data.banner?.type === "color"
                        ? data.banner.value
                        : "#2563EB",
                    backgroundImage:
                      data.banner?.type === "image"
                        ? `url(${data.banner.value})`
                        : "none",
                    backgroundSize: "cover",
                  }}
                  className="w-full py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {data.banner?.type === "image" && (
                    <div className="absolute inset-0 bg-black/30"></div>
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Smartphone size={18} /> Save Contact
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
