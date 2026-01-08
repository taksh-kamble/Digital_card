"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Check,
  X,
  Zap,
  Loader2,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Crown,
} from "lucide-react";

import { subscriptionAPI, setAuthToken } from "@/lib/api";

/* ---------------- PLANS ---------------- */

const PLANS = [
  {
    id: "FREE",
    name: "Starter",
    price: "₹0",
    period: "/ forever",
    description: "Perfect for individuals just getting started.",
    features: [
      "Up to 5 Digital Business Cards",
      "Basic QR Code",
      "Standard Themes",
      "Contact Download (VCF)",
    ],
    missing: ["Analytics", "Custom Branding", "Remove Branding"],
    color: "bg-slate-50",
    btnColor: "bg-slate-900",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹199",
    period: "/ month",
    description: "For professionals who want to stand out.",
    recommended: true,
    features: [
      "5 cards limit",
      "Custom QR Codes",
      "Premium Themes",
      "Analytics Dashboard",
    ],
    missing: ["Remove Branding"],
    color: "bg-blue-50 border-blue-500",
    btnColor: "bg-blue-600",
  },
  {
    id: "PREMIUM",
    name: "Business",
    price: "₹499",
    period: "/ month",
    description: "Ultimate control for teams and agencies.",
    features: [
      "Unlimited Digital Business Cards",
      "White Labeling (Remove Branding)",
      "Advanced Analytics",
      "Priority Support",
      "API Access",
    ],
    missing: [],
    color: "bg-slate-50",
    btnColor: "bg-slate-900",
  },
];

/* ---------------- PAGE ---------------- */

export default function SubscriptionPage() {
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState("");

  /* ---------- AUTH + LOAD ---------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/");
        return;
      }

      const token = await firebaseUser.getIdToken();
      setAuthToken(token);
      await loadSubscription();
    });

    return () => unsubscribe();
  }, []);

  async function loadSubscription() {
    try {
      const data = await subscriptionAPI.getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      setError("Could not load subscription details.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- PLAN CHANGE ---------- */

  async function handleSelectPlan(plan) {
    if (plan.id === subscription?.plan) return;

    setProcessing(plan.id);
    setError("");

    try {
      const response = await subscriptionAPI.selectPlan({
        plan: plan.id, // ✅ FIXED
      });

      if (response.requiresPayment) {
        // Demo flow → instant confirm
        await subscriptionAPI.confirmPayment({ plan: plan.id });
      }

      await loadSubscription();
      alert(`Successfully switched to ${plan.name} plan`);
    } catch (err) {
      setError(err.response?.data?.message || "Plan change failed.");
    } finally {
      setProcessing(null);
    }
  }

  /* ---------- LOADING ---------- */

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Checking your plan...</p>
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto mb-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-500 mt-4">
            Upgrade anytime. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Current Plan */}
        {subscription && (
          <div className="max-w-md mx-auto mb-12 bg-white p-6 rounded-2xl border flex justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">CURRENT PLAN</p>
              <p className="text-xl font-black text-slate-900 flex gap-2">
                {subscription.plan}
                <ShieldCheck className="text-green-500" size={18} />
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isCurrent = subscription?.plan === plan.id;
            const isLoading = processing === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-8 rounded-3xl border shadow-xl ${
                  plan.recommended ? "scale-105 border-blue-500" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="text-blue-600 font-bold mb-3 flex items-center gap-1">
                    <Zap size={14} /> Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-black mt-2">{plan.price}</p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex gap-2">
                      <Check className="text-green-600" size={16} /> {f}
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex gap-2 text-slate-400">
                      <X size={16} /> {f}
                    </div>
                  ))}
                </div>

                <button
                  disabled={isCurrent || isLoading}
                  onClick={() => handleSelectPlan(plan)}
                  className={`mt-8 w-full py-3 rounded-xl font-bold ${
                    isCurrent
                      ? "bg-slate-100 text-slate-400"
                      : "bg-blue-600 text-white hover:scale-105"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    <>
                      <Crown size={16} className="inline mr-1" />
                      Choose {plan.name}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-slate-400 text-sm flex justify-center gap-2">
          <CreditCard size={16} /> Secure payments
        </div>
      </div>
    </div>
  );
}
