import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "299.000",
      period: "month",
      icon: Zap,
      iconColor: "text-blue-400",
      features: [
        "Full dashboard access",
        "AI food scanner (LogMeal)",
        "Daily nutrition tracking",
        "Recharts analytics",
        "Manual food logging",
      ],
      popular: false,
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: "799.000",
      period: "3 months",
      icon: Star,
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
      price: "2.499.000",
      period: "year",
      icon: Crown,
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
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
              Choose Your Plan
            </h1>
            <p className="text-xl text-center text-muted-foreground mb-12 animate-fade-in">
              Select the perfect membership plan and unlock your full fitness potential
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative p-8 rounded-xl border transition-all hover:shadow-xl animate-slide-up ${
                      plan.popular
                        ? "border-primary bg-gradient-to-b from-primary/5 to-secondary/5 scale-105"
                        : "border-border bg-card"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <Icon className={`h-8 w-8 mx-auto mb-3 ${plan.iconColor}`} />
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-muted-foreground">Rp</span>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Navigates to Payment page with the plan pre-selected */}
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      className="w-full"
                      onClick={() => navigate(`/payment?plan=${plan.id}`)}
                    >
                      Get Started
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                All plans include access to our state-of-the-art facilities and equipment
              </p>
              <p className="text-sm text-muted-foreground">
                Need a custom plan for your organization?{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
