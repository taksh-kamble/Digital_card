"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cardAPI, setAuthToken, subscriptionAPI } from "@/lib/api"; // Added subscriptionAPI
import { CardPreview } from "@/components/CardPreview";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  User,
  Palette,
  Trash2,
  Share2,
  Lock, // Added Lock icon
  Type,
} from "lucide-react";

// --- Layout Definitions ---
const layoutOptions = [
  { id: "minimal", isPro: false },
  { id: "modern", isPro: false },
  { id: "creative", isPro: false },
  { id: "corporate", isPro: true },
  { id: "glass", isPro: true },
  { id: "elegant", isPro: true },
];

export default function EditCardPage() {
  const { cardId } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    designation: "",
    company: "",
    bio: "",
    profileUrl: "",
    banner: { type: "color", value: "" },
    cardSkin: "",
    layout: "",
    fontStyle: "",
    phone: "",
    email: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });

  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New Subscription State
  const [subscription, setSubscription] = useState(null);

  // --- FONT OPTIONS CONFIGURATION ---
  const fontOptions = [
    { id: "basic", label: "Basic", class: "font-sans" },
    { id: "serif", label: "Serif", class: "font-serif" },
    { id: "mono", label: "Mono", class: "font-mono" },
    { id: "script", label: "Script", class: "font-serif italic" },
    {
      id: "wide",
      label: "Wide",
      class: "font-sans tracking-widest uppercase text-[10px]",
    },
    { id: "bold", label: "Bold", class: "font-sans font-black" },
  ];

  // Determine Pro Status
  const isPro = subscription?.isUnlimited || subscription?.plan === "pro";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);

        // Load both Card Data and Subscription Data
        await Promise.all([loadCard(), fetchSubscription()]);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [cardId]);

  async function fetchSubscription() {
    try {
      const res = await subscriptionAPI.getCurrentSubscription();
      setSubscription(res);
    } catch (err) {
      console.error("Failed to fetch subscription", err);
    }
  }

  async function loadCard() {
    try {
      const data = await cardAPI.getCardById(cardId);
      setForm({
        ...data,
        banner: data.banner || { type: "color", value: "#2563eb" },
        layout: data.layout || "minimal",
      });
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't find this card or you don't have permission to edit it."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // --- Handle Click on Layout ---
  const handleLayoutSelect = (layoutId, layoutIsPro) => {
    // If it's a Pro layout and user is NOT Pro -> Redirect
    if (layoutIsPro && !isPro) {
      if (
        confirm(
          "This is a Premium layout. Would you like to upgrade to Pro to use it?"
        )
      ) {
        router.push("/subscription");
      }
      return;
    }

    // Otherwise, select the layout
    setForm({ ...form, layout: layoutId });
  };

  async function handleSave() {
    setSaving(true);
    setError("");

    // Security Check before saving
    const selectedLayoutObj = layoutOptions.find((l) => l.id === form.layout);
    if (selectedLayoutObj?.isPro && !isPro) {
      setError("You are using a Pro layout. Please upgrade to save changes.");
      setSaving(false);
      return;
    }

    try {
      await cardAPI.updateCard(cardId, form);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await cardAPI.deleteCard(cardId);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to delete card.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-red-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Delete Card?
            </h3>
            <p className="text-slate-500 mb-8 text-center">
              This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold"
              >
                {deleting ? "Deleting..." : "Yes, Delete Card"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />{" "}
            <span className="hidden sm:inline">Back</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}{" "}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-10">
        {/* Editor */}
        <div className="w-full lg:w-3/5 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-5 text-sm font-bold flex justify-center gap-2 transition-all ${
                activeTab === "content"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <User size={18} /> Content
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`flex-1 py-5 text-sm font-bold flex justify-center gap-2 transition-all ${
                activeTab === "design"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Palette size={18} /> Design
            </button>
          </div>

          <div className="p-8 lg:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {activeTab === "content" ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Identity Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                  <Input
                    label="Designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                  />
                  <Input
                    label="Company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                  />
                  <Input
                    label="Profile Image URL"
                    name="profileUrl"
                    value={form.profileUrl}
                    onChange={handleChange}
                  />
                </div>

                {/* Bio Section */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase ml-1 mb-1">
                    About
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    placeholder="Tell people who you are..."
                  />
                </div>

                {/* Contact Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  <Input
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  <Input
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>

                {/* Social Media Section */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase ml-1 mb-3 flex items-center gap-2">
                    <Share2 size={12} /> Social Media Links
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="LinkedIn URL"
                      name="linkedin"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                    />
                    <Input
                      label="Twitter (X) URL"
                      name="twitter"
                      value={form.twitter}
                      onChange={handleChange}
                      placeholder="@username or url"
                    />
                    <Input
                      label="Instagram URL"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="@username or url"
                    />
                    <Input
                      label="Facebook URL"
                      name="facebook"
                      value={form.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in duration-300">
                {/* LAYOUT SELECTOR */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase ml-1">
                      Choose Layout
                    </label>
                    {!isPro && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        Free Plan
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {layoutOptions.map((layout) => {
                      const isLocked = layout.isPro && !isPro;

                      return (
                        <button
                          key={layout.id}
                          onClick={() =>
                            handleLayoutSelect(layout.id, layout.isPro)
                          }
                          className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group cursor-pointer ${
                            form.layout === layout.id
                              ? "border-blue-600 bg-blue-50/50"
                              : "border-slate-100 bg-white"
                          } ${
                            isLocked
                              ? "hover:ring-2 hover:ring-amber-400 hover:border-amber-400"
                              : "hover:border-blue-200"
                          }`}
                        >
                          {/* LOCKED OVERLAY */}
                          {isLocked && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/60 backdrop-blur-[1px] rounded-2xl transition-opacity group-hover:bg-slate-50/40">
                              <div className="bg-slate-900 text-white p-2 rounded-full shadow-lg group-hover:bg-amber-500 transition-colors">
                                <Lock size={16} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-900 mt-1 bg-white/80 px-2 rounded-full">
                                Upgrade
                              </span>
                            </div>
                          )}

                          <div className="w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden relative shadow-sm border border-slate-200/50">
                            {layout.id === "minimal" && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-50">
                                <div className="w-8 h-8 rounded-full bg-slate-400"></div>
                                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                              </div>
                            )}
                            {layout.id === "modern" && (
                              <div className="absolute inset-0 flex flex-col p-2 gap-2 opacity-50">
                                <div className="w-full h-6 bg-slate-300 rounded-t-lg mb-[-10px]"></div>
                                <div className="w-8 h-8 rounded-lg bg-slate-400 border-2 border-white z-10 ml-1"></div>
                              </div>
                            )}
                            {layout.id === "creative" && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-400 shadow-sm"></div>
                                </div>
                              </div>
                            )}
                            {layout.id === "corporate" && (
                              <div className="absolute inset-0 flex opacity-60">
                                <div className="w-1/3 h-full bg-slate-600 flex flex-col items-center pt-2 gap-1">
                                  <div className="w-5 h-5 rounded-full bg-white/50"></div>
                                </div>
                                <div className="w-2/3 bg-white"></div>
                              </div>
                            )}
                            {layout.id === "glass" && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-60 bg-gradient-to-br from-blue-200 to-purple-200">
                                <div className="w-16 h-10 bg-white/50 backdrop-blur-sm rounded border border-white/60"></div>
                              </div>
                            )}
                            {layout.id === "elegant" && (
                              <div className="absolute inset-0 p-2 flex flex-col items-center justify-center opacity-50">
                                <div className="w-full h-full border border-slate-500 flex items-center justify-center">
                                  <div className="w-6 h-6 rotate-45 border border-slate-500"></div>
                                </div>
                              </div>
                            )}
                          </div>

                          <span className="text-xs font-bold capitalize text-slate-600">
                            {layout.id}
                          </span>
                          {form.layout === layout.id && (
                            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Banner Colors */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase ml-1 mb-2">
                    Banner & Skin
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          banner: { ...form.banner, type: "color" },
                        })
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        form.banner.type === "color"
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      Color
                    </button>
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          banner: { ...form.banner, type: "image" },
                        })
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        form.banner.type === "image"
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white border-slate-200 text-slate-600"
                      }`}
                    >
                      Image
                    </button>
                  </div>

                  {form.banner.type === "color" ? (
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.banner.value}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            banner: { type: "color", value: e.target.value },
                          })
                        }
                        className="h-10 w-12 rounded cursor-pointer border-0"
                      />
                      <input
                        value={form.banner.value}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            banner: { type: "color", value: e.target.value },
                          })
                        }
                        className="flex-1 px-3 border rounded-xl text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      placeholder="Banner Image URL..."
                      value={form.banner.value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          banner: { type: "image", value: e.target.value },
                        })
                      }
                    />
                  )}
                </div>

                {/* Typography Selection (UPDATED: 6 FONTS) */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase ml-1 mb-2">
                    Typography
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {fontOptions.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setForm({ ...form, fontStyle: f.id })}
                        className={`flex items-center justify-center py-3 rounded-lg border text-sm capitalize transition-all ${
                          form.fontStyle === f.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        } ${f.class}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Skin */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase ml-1 mb-2">
                    Page Background (Skin)
                  </label>
                  <Input
                    placeholder="#F3F4F6 or https://..."
                    value={form.cardSkin || ""}
                    onChange={(e) =>
                      setForm({ ...form, cardSkin: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-slate-400 ml-1 mt-1">
                    Paste a HEX color code (e.g. #ffffff) or a direct image
                    link. Essential for "Glass" layout.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-red-600 text-xs font-bold hover:underline"
                  >
                    <Trash2 size={14} /> Delete Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="sticky top-28">
            <CardPreview data={form} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-[11px] font-black text-slate-500 ml-1 uppercase mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
      />
    </div>
  );
}
