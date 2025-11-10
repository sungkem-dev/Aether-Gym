import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "299,000",
      period: "month",
      features: [
        "Access to gym facilities",
        "Basic nutrition tracking",
        "Community support",
        "Mobile app access",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "499,000",
      period: "month",
      features: [
        "Everything in Basic",
        "AI meal recommendations",
        "Advanced statistics & charts",
        "Food photo upload",
        "Priority support",
        "Personal trainer consultations",
      ],
      popular: true,
    },
    {
      name: "Annual",
      price: "4,999,000",
      period: "year",
      features: [
        "Everything in Pro",
        "2 months free",
        "Exclusive workshops",
        "Premium meal plans",
        "Body composition analysis",
        "Lifetime member benefits",
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
              Select the perfect membership plan for your fitness journey
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
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
                        <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" className="block">
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                All plans include access to our state-of-the-art facilities and equipment
              </p>
              <p className="text-sm text-muted-foreground">
                Need a custom plan for your organization? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
