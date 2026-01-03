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

// Assuming you add subscription endpoints to your api.js
// If not, you can replace these calls with standard fetch + auth headers
import { subscriptionAPI, setAuthToken } from "@/lib/api";

const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: "₹0",
    period: "/ forever",
    description: "Perfect for individuals just getting started.",
    features: [
      "1 Digital Business Card",
      "Basic QR Code",
      "Standard Themes",
      "Contact Download (VCF)",
    ],
    missing: ["Analytics", "Custom Branding", "Multiple Layouts"],
    color: "bg-slate-50",
    btnColor: "bg-slate-900",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹199",
    period: "/ month",
    description: "For professionals who want to stand out.",
    recommended: true,
    features: [
      "5 Digital Business Cards",
      "Custom QR Codes",
      "Premium Themes",
      "Remove Branding",
      "Analytics Dashboard",
    ],
    missing: [],
    color: "bg-blue-50 border-blue-500",
    btnColor: "bg-blue-600",
  },
  {
    id: "business",
    name: "Business",
    price: "₹499",
    period: "/ month",
    description: "Ultimate control for teams and agencies.",
    features: [
      "Unlimited Cards",
      "Team Management",
      "White Labeling",
      "Priority Support",
      "API Access",
    ],
    missing: [],
    color: "bg-slate-50",
    btnColor: "bg-slate-900",
  },
];

export default function SubscriptionPage() {
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // Stores the ID of the plan being processed
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);
        loadSubscription();
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);

  async function loadSubscription() {
    try {
      const data = await subscriptionAPI.getCurrentSubscription();
      setSubscription(data);
    } catch (err) {
      // If 404, user is on free plan implicitly, or handle as needed
      if (err.response?.status === 404) {
        setSubscription({ planId: "free" });
      } else {
        setError("Could not load subscription details.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectPlan(plan) {
    if (plan.id === subscription?.planId) return; // Already on this plan

    setProcessing(plan.id);
    setError("");

    try {
      // 1. Create Checkout Session or Update Plan
      const response = await subscriptionAPI.selectPlan({ planId: plan.id });

      // 2. Handle Payment Redirect (if strictly Stripe/Razorpay)
      if (response.requiresPayment && response.paymentUrl) {
        window.location.href = response.paymentUrl;
        return;
      }

      // 3. If it's a free switch or instant upgrade (no payment required)
      await loadSubscription();
      alert(`Successfully switched to ${plan.name} plan!`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to process request.");
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Checking your plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">
            Upgrade your experience
          </h2>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Unlock the full potential of your digital identity with our
            professional tools.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        {/* Current Plan Badge */}
        {subscription && subscription.planId !== "free" && (
          <div className="max-w-md mx-auto mb-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Plan
              </p>
              <p className="text-xl font-black text-slate-900 flex items-center gap-2">
                {subscription.planName || "Pro Plan"}{" "}
                <ShieldCheck className="text-green-500" size={20} />
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Renews on</p>
              <p className="font-bold text-slate-900">
                {new Date(subscription.renewalDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const isCurrent = subscription?.planId === plan.id;
            const isLoading = processing === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 ${
                  plan.color
                } ${
                  plan.recommended
                    ? "shadow-2xl scale-105 z-10 border-2"
                    : "bg-white shadow-xl border border-slate-100 hover:shadow-2xl"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-blue-200">
                    <Zap size={14} fill="currentColor" /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-4 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={`mt-1 p-1 rounded-full ${
                          plan.recommended
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className="text-slate-700 font-medium text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.missing.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 opacity-50"
                    >
                      <div className="mt-1 p-1 rounded-full bg-slate-50 text-slate-400">
                        <X size={12} strokeWidth={4} />
                      </div>
                      <span className="text-slate-500 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={
                    isCurrent ||
                    isLoading ||
                    (processing && processing !== plan.id)
                  }
                  className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                    ${
                      isCurrent
                        ? "bg-slate-100 text-slate-400 cursor-default shadow-none"
                        : `${plan.btnColor} text-white hover:scale-[1.02] hover:shadow-xl`
                    }
                  `}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : plan.id === "free" ? (
                    "Downgrade"
                  ) : (
                    <>
                      {" "}
                      <Crown size={18} /> Upgrade to {plan.name}{" "}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Footer */}
        <div className="mt-20 text-center border-t border-slate-200 pt-10">
          <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            <CreditCard size={16} /> Secure payment processing powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
