import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  Loader2,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Zap,
  Crown,
  Star,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

// ─── Plan definitions — must match server/src/services/midtrans.service.ts ──
const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: 299_000,
    priceDisplay: "299.000",
    period: "month",
    icon: Zap,
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    activeColor: "from-blue-500/30 to-cyan-500/20 border-blue-500",
    iconColor: "text-blue-400",
    features: [
      "Full dashboard & AI food scanner",
      "Daily nutrition tracking",
      "Recharts analytics (daily, weekly, monthly)",
      "Manual food logging",
      "Community access",
    ],
    popular: false,
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 799_000,
    priceDisplay: "799.000",
    period: "3 months",
    icon: Star,
    color: "from-primary/20 to-secondary/10 border-primary/30",
    activeColor: "from-primary/30 to-secondary/20 border-primary",
    iconColor: "text-primary",
    features: [
      "Everything in Monthly",
      "Save ~11% vs monthly",
      "Priority AI scan queue",
      "Diet planner & meal prep",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "annual",
    name: "Annual",
    price: 2_499_000,
    priceDisplay: "2.499.000",
    period: "year",
    icon: Crown,
    color: "from-yellow-500/20 to-orange-500/10 border-yellow-500/30",
    activeColor: "from-yellow-500/30 to-orange-500/20 border-yellow-500",
    iconColor: "text-yellow-400",
    features: [
      "Everything in Quarterly",
      "Save ~30% vs monthly",
      "2 months free",
      "Exclusive workshops",
      "Body composition analysis",
    ],
    popular: false,
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

// ─── Payment state machine ────────────────────────────────────────────────────
type PaymentState = "selecting" | "confirming" | "processing" | "success" | "error";

// ─── Component ────────────────────────────────────────────────────────────────
const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken, refreshMembership, user, membershipLoading } = useAuthContext();

  // Pre-select plan from URL: /payment?plan=quarterly
  const urlPlan = searchParams.get("plan") as PlanId | null;
  const defaultPlan = PLANS.find(p => p.id === urlPlan)?.id ?? "quarterly";

  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(defaultPlan);
  const [paymentState, setPaymentState] = useState<PaymentState>("selecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId)!;

  // ── Step 1: Create transaction on backend, then open Midtrans Snap ──────────
  const handlePay = async () => {
    if (!accessToken) {
      toast.error("Please sign in first.");
      navigate("/login");
      return;
    }

    setPaymentState("processing");
    setErrorMessage("");

    try {
      // Call backend to get Midtrans Snap token
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to create payment session.");
      }

      setOrderId(data.data.order_id);

      // ── Midtrans Snap Integration ────────────────────────────────────────
      // Midtrans Snap is loaded via a <script> tag in index.html:
      //   <script src="https://app.sandbox.midtrans.com/snap/snap.js"
      //           data-client-key="YOUR_CLIENT_KEY"></script>
      //
      // In production change to: https://app.midtrans.com/snap/snap.js
      //
      // snap.pay() opens the Midtrans payment modal with the snap_token.
      // The callbacks handle the result on the client side.

      if (typeof window.snap !== "undefined") {
        window.snap.pay(data.data.snap_token, {
          onSuccess: async (_result: unknown) => {
            setPaymentState("success");
            // refreshMembership() fetches /api/payment/status and updates isMember.
            // It returns true when the backend has processed the payment.
            // If the webhook hasn't fired yet, poll up to 5 times with 1.5s delay.
            let isNowMember = await refreshMembership();
            if (!isNowMember) {
              for (let attempt = 0; attempt < 5 && !isNowMember; attempt++) {
                await new Promise(r => setTimeout(r, 1500));
                isNowMember = await refreshMembership();
              }
            }
            toast.success("🎉 Payment successful! Your membership is now active.");
          },
          onPending: (_result: unknown) => {
            toast.info("⏳ Payment pending. We'll activate your membership once confirmed.");
            setPaymentState("selecting");
          },
          onError: (_result: unknown) => {
            setErrorMessage("Payment was declined or an error occurred. Please try again.");
            setPaymentState("error");
          },
          onClose: () => {
            // User closed the Snap modal without completing payment
            if (paymentState === "processing") {
              setPaymentState("selecting");
            }
          },
        });
      } else {
        // ── Fallback: Redirect to Midtrans hosted payment page ────────────
        // This handles cases where the Snap.js script hasn't loaded yet.
        toast.info("Redirecting to payment page...");
        window.open(data.data.redirect_url, "_blank");
        setPaymentState("confirming");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setErrorMessage(msg);
      setPaymentState("error");
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (paymentState === "success") {
    // isMembershipLoading is true while refreshMembership() is polling
    const readyToGo = !membershipLoading;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">You're a Member! 🏋️</h1>
          <p className="text-muted-foreground mb-2">
            Your <strong>{selectedPlan.name}</strong> membership is now active.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted px-3 py-1 rounded-md inline-block">
              Order ID: {orderId}
            </p>
          )}
          <Button
            variant="hero"
            className="w-full"
            disabled={!readyToGo}
            onClick={() => navigate("/dashboard")}
          >
            {readyToGo ? (
              "Go to Dashboard →"
            ) : (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Activating membership...</>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  // ── Confirming screen (redirect flow fallback) ─────────────────────────────
  if (paymentState === "confirming") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Waiting for Payment</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Complete your payment in the Midtrans page that just opened. This page will update automatically.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setPaymentState("selecting")}>
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={membershipLoading}
              onClick={async () => {
                // Await refreshMembership so MemberRoute sees isMember=true
                const isNowMember = await refreshMembership();
                if (isNowMember) {
                  navigate("/dashboard");
                } else {
                  toast.info("Payment not confirmed yet. Please wait a moment and try again.");
                }
              }}
            >
              {membershipLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking...</>
              ) : (
                "I've Paid →"
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main checkout UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pricing")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Choose Your Plan</h1>
            <p className="text-xs text-muted-foreground">
              {user?.email ?? "Signed in"} · Secure checkout via Midtrans
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Plan Selection ───────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Select a Membership Plan</h2>

            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => { setSelectedPlanId(plan.id); setPaymentState("selecting"); }}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] bg-gradient-to-br ${
                    isSelected ? plan.activeColor : plan.color
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 right-4 text-xs bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3 py-0.5 rounded-full font-semibold">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Radio indicator */}
                    <div className={`mt-1 h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                          <span className="font-bold text-lg">{plan.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Rp</span>
                          <span className="text-2xl font-bold ml-1">{plan.priceDisplay}</span>
                          <span className="text-xs text-muted-foreground ml-1">/{plan.period}</span>
                        </div>
                      </div>

                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue as Guest */}
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
              >
                ← Continue as Guest (limited access)
              </Button>
            </div>
          </div>

          {/* ── Right: Order Summary & Pay Button ─────────────────────────── */}
          <div className="space-y-4">
            <Card className="p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{selectedPlan.name} Membership</span>
                  <span className="font-medium">Rp {selectedPlan.priceDisplay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedPlan.period}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rp {selectedPlan.priceDisplay}</span>
                </div>
              </div>

              {/* Error state */}
              {paymentState === "error" && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                variant="hero"
                className="w-full mb-3"
                size="lg"
                onClick={handlePay}
                disabled={paymentState === "processing"}
              >
                {paymentState === "processing" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Rp {selectedPlan.priceDisplay}
                  </>
                )}
              </Button>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                <span>Secured by Midtrans · 256-bit SSL</span>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-2">Accepted payments</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {["QRIS", "GoPay", "OVO", "BCA", "Mandiri", "BNI"].map(method => (
                    <span key={method} className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Sandbox note */}
            <div className="text-xs text-muted-foreground bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-center">
              🧪 <strong>Sandbox mode</strong> — No real money charged.
              Use test cards from{" "}
              <a
                href="https://simulator.sandbox.midtrans.com/qris/index"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Midtrans Simulator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

// ─── TypeScript declaration for Midtrans Snap ────────────────────────────────
// This tells TS that window.snap is available after loading the Snap.js script.
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}
