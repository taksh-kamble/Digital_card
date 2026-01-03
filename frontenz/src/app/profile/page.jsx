"use client";

import React, { useEffect, useState } from "react";

import {
  Camera,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Link2,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Loader2,
  Edit,
} from "lucide-react";

// Utils
const getAvatarUrl = (u) => {
  if (u?.profileUrl && u.profileUrl.trim() !== "") return u.profileUrl;
  if (u?.fullName)
    return `https://api.dicebear.com/7.x/initials/svg?seed=${u.fullName}`;
  return "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
};

// Profile Page
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        User not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-6 p-6 border-b border-gray-100">
          <div className="relative">
            <img
              src={getAvatarUrl(user)}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-blue-50 object-cover"
            />
            <Camera
              size={20}
              className="absolute bottom-0 right-0 text-blue-600 bg-white rounded-full p-1 cursor-pointer"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user.fullName}
            </h1>
            <p className="text-gray-500">{user.designation}</p>
            <p className="text-gray-500">{user.company}</p>
          </div>
          <button
            className="ml-auto flex items-center gap-2 text-blue-600 font-medium border border-blue-100 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            onClick={() => (window.location.href = "/edit-profile")}
          >
            <Edit size={16} /> Edit Profile
          </button>
        </div>

        {/* Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Contact Info
            </h2>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={16} />
              <span>{user.email || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={16} />
              <span>{user.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Link2 size={16} />
              <span>{user.website || "-"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Social Profiles
            </h2>
            <div className="flex items-center gap-3 text-gray-600">
              <Linkedin size={16} />
              <span>{user.linkedin || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Twitter size={16} />
              <span>{user.twitter || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Instagram size={16} />
              <span>{user.instagram || "-"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Facebook size={16} />
              <span>{user.facebook || "-"}</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 mt-4">
            <h2 className="text-lg font-semibold text-gray-700">Bio</h2>
            <p className="text-gray-600">{user.bio || "No bio provided."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
