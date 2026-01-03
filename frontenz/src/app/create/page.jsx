"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardPreview } from "@/components/CardPreview";
import {
  User,
  Palette,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  Upload,
  CheckCircle,
  Type,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { cardAPI, setAuthToken } from "@/lib/api";
export default function CreateCardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    profileUrl: "",
    banner: { type: "color", value: "#2563eb" },
    fontStyle: "basic",
    cardSkin: null,
    layout: "minimal",
    fullName: "",
    designation: "",
    company: "",
    bio: "",
    phone: "",
    email: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateBanner = (type, value) => {
    setForm({ ...form, banner: { type, value } });
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Check Auth
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to create a card.");
        setLoading(false);
        return;
      }

      // 2. Get Fresh Token & Set Axios Header
      const token = await user.getIdToken();
      setAuthToken(token); // Set the token in headers here

      // 3. Send Request using cardAPI
      const response = await cardAPI.createCard(form); // Sends the request with the token in the headers

      // 4. Success
      const { cardId } = response.data;
      router.push(`/edit/${cardId}`);
    } catch (err) {
      console.error("Create Card Error:", err);

      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.message;

        if (status === 403) {
          setError(
            "Card limit reached. Upgrade your plan to create more cards."
          );
        } else if (status === 401) {
          setError("You must be logged in to create a card.");
        } else {
          setError(errorMessage || `Server Error: ${status}`);
        }
      } else if (err.request) {
        setError("Cannot connect to server. Check if your backend is running.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Card Builder</h1>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200"
          >
            {loading ? "Creating..." : "Publish Card"} <ArrowRight size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        {/* Editor Panel */}
        <div className="w-full lg:w-3/5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <TabButton
                active={activeTab === "content"}
                onClick={() => setActiveTab("content")}
                icon={<User size={18} />}
                label="Content"
              />
              <TabButton
                active={activeTab === "design"}
                onClick={() => setActiveTab("design")}
                icon={<Palette size={18} />}
                label="Design"
              />
            </div>

            <div className="p-6 lg:p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              {activeTab === "content" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <FormSection title="Identity">
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
                  </FormSection>

                  <FormSection title="Contact Info">
                    <Input
                      label="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    <Input
                      label="Website"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                    />
                  </FormSection>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                      placeholder="Tell people who you are..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Layout Choice */}
                  <div>
                    <SectionHeading
                      icon={<Type size={18} />}
                      title="Layout & Font"
                    />
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {["minimal", "modern", "creative"].map((l) => (
                        <button
                          key={l}
                          onClick={() => setForm({ ...form, layout: l })}
                          className={`py-3 rounded-xl border-2 transition-all capitalize font-bold text-sm ${
                            form.layout === l
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-6">
                      {["basic", "serif", "mono"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setForm({ ...form, fontStyle: f })}
                          className={`flex-1 py-2 rounded-lg border text-sm capitalize ${
                            form.fontStyle === f
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner Colors */}
                  <div>
                    <SectionHeading
                      icon={<Palette size={18} />}
                      title="Banner Theme"
                    />
                    <div className="flex flex-wrap gap-3 mt-4">
                      {[
                        "#2563eb",
                        "#7C3AED",
                        "#DB2777",
                        "#059669",
                        "#DC2626",
                        "#0F172A",
                        "#F59E0B",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateBanner("color", color)}
                          className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 ${
                            form.banner.value === color
                              ? "border-white ring-2 ring-blue-500 scale-110"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-28 flex flex-col items-center">
            <div className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Preview
            </div>

            <div className="relative group">
              {/* Phone Frame Mockup */}
              <div className="absolute -inset-4 border-[10px] border-slate-900 rounded-[3.5rem] pointer-events-none shadow-2xl z-10"></div>
              <div className="relative z-0 overflow-hidden rounded-[2.5rem]">
                <CardPreview data={form} />
              </div>
            </div>

            <p className="mt-8 text-slate-400 text-sm italic text-center max-w-[280px]">
              This is how your digital card will appear to others when shared.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold transition-all border-b-2 ${
        active
          ? "border-blue-600 text-blue-600 bg-white"
          : "border-transparent text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-2 text-slate-800 font-bold">
      {icon} <span>{title}</span>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold text-slate-500 ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
      />
    </div>
  );
}
