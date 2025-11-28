import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Activity, Target, TrendingUp, Heart, Users, Award, Zap, Check, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import gymHero from "@/assets/gym-hero.jpg";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

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
      
      {/* Hero Section */}
      <section id="home" className="relative pt-24 pb-20 overflow-hidden min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${gymHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Transform Your Body
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Fuel Your Life with Smart Nutrition and Precision Tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="hero" className="group">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose FitLife Gym?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow animate-slide-up">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Tracking</h3>
              <p className="text-muted-foreground">
                Track your nutrition and calories with AI-powered recommendations tailored to your fitness goals.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Plans</h3>
              <p className="text-muted-foreground">
                Get customized meal plans and workout routines designed specifically for your body and goals.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Visualize your journey with detailed statistics and charts showing your nutrition and fitness progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About FitLife Gym
            </h2>
            <p className="text-xl text-center text-muted-foreground mb-12">
              Empowering individuals to live healthier, stronger, and smarter lives through innovative fitness technology.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  To revolutionize fitness by combining cutting-edge technology with personalized nutrition tracking, making healthy living accessible and achievable for everyone.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community First</h3>
                <p className="text-muted-foreground">
                  We believe in building a supportive community where members motivate each other and celebrate achievements together on their fitness journey.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
                <p className="text-muted-foreground">
                  Our team of certified trainers and nutritionists ensures you receive professional guidance backed by science and proven results.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
                <p className="text-muted-foreground">
                  Leverage AI-powered recommendations and detailed analytics to optimize your nutrition and track your progress with precision.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 border border-border">
              <h3 className="text-3xl font-bold mb-4">Our Philosophy</h3>
              <p className="text-muted-foreground mb-4">
                At FitLife Gym, we understand that true fitness isn't just about working out—it's about nourishing your body with the right nutrition and tracking your progress intelligently.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Advanced nutrition tracking with photo upload capabilities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>AI-powered meal recommendations tailored to your goals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Detailed statistics and visualizations of your progress</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Personalized support from our expert team</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-xl text-center text-muted-foreground mb-12">
              Select the perfect membership plan for your fitness journey
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative p-8 rounded-xl border transition-all hover:shadow-xl ${
                    plan.popular
                      ? "border-primary bg-gradient-to-b from-primary/5 to-secondary/5 scale-105"
                      : "border-border bg-card"
                  }`}
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
                Need a custom plan for your organization? <a href="#contact" className="text-primary hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already achieved their fitness goals with our smart nutrition tracking and AI recommendations.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="shadow-xl">
              Start Your Journey Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-xl text-center text-muted-foreground mb-12">
              Have questions? We're here to help you start your fitness journey
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      placeholder="Tell us about your fitness goals..."
                      rows={6}
                    />
                  </div>
                  
                  <Button type="submit" variant="hero" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-muted-foreground">
                        Jl. Fitness Boulevard No. 123<br />
                        Jakarta Selatan, DKI Jakarta 12345
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">
                        +62 21 1234 5678<br />
                        +62 812 3456 7890
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">
                        info@fitlifegym.com<br />
                        support@fitlifegym.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Operating Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 05:00 - 23:00<br />
                        Saturday - Sunday: 06:00 - 22:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FitLife Gym. Transform Your Body, Fuel Your Life.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
