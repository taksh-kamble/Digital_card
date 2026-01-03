"use client";
import React, { useState, useEffect } from "react";
// 1. Import useRouter for redirection
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Smartphone, Apple, Sparkles } from "lucide-react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { setAuthToken, userAPI } from "@/lib/api";

const BANNER_IMAGE_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// --- Sub-Component: AuthFormContent ---
const AuthFormContent = ({
  mode,
  formData,
  handleInputChange,
  handleSubmit,
  switchView,
  resetSent,
  handleGoogleLogin,
  handleAppleLogin,
  handlePhoneLogin,
}) => {
  return (
    <div className="w-full">
      <form onSubmit={(e) => handleSubmit(e, mode)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
            placeholder="you@example.com"
            required
          />
        </div>

        {mode !== "forgot-password" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="••••••••"
              required
            />
          </div>
        )}

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="••••••••"
              required
            />
          </div>
        )}

        {mode === "login" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => switchView("forgot-password")}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {mode === "forgot-password" && resetSent ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-medium border border-green-100">
            Password reset email sent! Check your inbox.
          </div>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {mode === "login"
                ? "Log In"
                : mode === "signup"
                ? "Sign Up"
                : "Send Reset Link"}
            </span>
          </button>
        )}
      </form>

      {mode !== "forgot-password" && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="size-5 flex items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                G
              </div>
            </button>
            <button
              onClick={handleAppleLogin}
              className="flex items-center justify-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
            >
              <Apple size={20} />
            </button>
            <button
              onClick={handlePhoneLogin}
              className="flex items-center justify-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
            >
              <Smartphone size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-slate-500 mt-8">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => switchView("signup")}
              className="text-blue-600 font-bold hover:underline"
            >
              Sign up now
            </button>
          </>
        ) : mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchView("login")}
              className="text-blue-600 font-bold hover:underline"
            >
              Log in here
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => switchView("login")}
            className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={16} /> Back to Log In
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
  const router = useRouter(); // 2. Initialize router
  const views = ["forgot-password", "login", "signup"];
  const [view, setView] = useState(initialView);
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 1. Manage Auth State and Token Header
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);

        try {
          await userAPI.createOrUpdate({
            email: user.email,
            fullName: user.displayName || "New User",
            profileUrl: user.photoURL || "",
          });
        } catch (error) {
          console.error("Backend user sync failed:", error);
        }
      } else {
        setAuthToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setResetSent(false);
      setFormData({ email: "", password: "", confirmPassword: "" });
    }
  }, [isOpen, initialView]);

  const switchView = (newView) => {
    setView(newView);
    setResetSent(false);
    setFormData({ email: "", password: "", confirmPassword: "" });
  };

  if (!isOpen) return null;

  const currentViewIndex = views.indexOf(view);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    if (!auth) return alert("Firebase not configured");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
      router.push("/dashboard"); // 3. Redirect to dashboard
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleAppleLogin = async () => {
    if (!auth) return alert("Firebase not configured");
    const provider = new OAuthProvider("apple.com");
    try {
      await signInWithPopup(auth, provider);
      onClose();
      router.push("/dashboard"); // 3. Redirect to dashboard
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handlePhoneLogin = () => {
    console.log("Phone login requested");
  };

  const handleSubmit = async (e, submitMode) => {
    e.preventDefault();
    if (!auth) return alert("Firebase not configured");
    const { email, password, confirmPassword } = formData;

    try {
      if (submitMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
        router.push("/dashboard"); // 3. Redirect to dashboard
      } else if (submitMode === "signup") {
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        onClose();
        router.push("/dashboard"); // 3. Redirect to dashboard
      } else if (submitMode === "forgot-password") {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-all duration-300 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-3xl animate-fade-in-up relative my-8 flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Image Banner */}
        <div
          className="hidden md:flex md:w-1/2 bg-cover bg-center relative items-end p-10"
          style={{ backgroundImage: `url('${BANNER_IMAGE_URL}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 mb-4 text-blue-200">
              <Sparkles size={24} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Welcome Aboard
              </span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Begin your <br /> journey here.
            </h2>
            <p className="text-slate-200 text-lg font-medium">
              Join our community and unlock exclusive access.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full md:w-1/2 relative flex flex-col">
          <div className="p-8 flex justify-between items-center relative z-10">
            <div className="relative h-8 w-full overflow-hidden mr-8">
              {["Reset Password", "Welcome Back!", "Create Account"].map(
                (title, idx) => (
                  <h3
                    key={title}
                    className={`absolute inset-0 text-2xl font-extrabold text-slate-900 text-left transition-all duration-500 transform ${
                      idx === currentViewIndex
                        ? "translate-y-0 opacity-100"
                        : idx < currentViewIndex
                        ? "-translate-y-full opacity-0"
                        : "translate-y-full opacity-0"
                    }`}
                  >
                    {title}
                  </h3>
                )
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-800 transition-colors p-2 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-hidden flex-grow relative">
            <div
              className="flex items-start h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${currentViewIndex * 100}%)` }}
            >
              {views.map((viewMode) => (
                <div key={viewMode} className="w-full flex-shrink-0 p-8 pt-2">
                  <AuthFormContent
                    mode={viewMode}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    switchView={switchView}
                    resetSent={resetSent}
                    handleGoogleLogin={handleGoogleLogin}
                    handleAppleLogin={handleAppleLogin}
                    handlePhoneLogin={handlePhoneLogin}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
