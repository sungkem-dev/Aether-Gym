import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Activity, Target, TrendingUp, Heart, Users, Award, Zap, Check, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import gymHero from "@/assets/gym-hero.jpg";

const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ParallaxCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section with Parallax */}
      <section id="home" ref={heroRef} className="relative pt-24 pb-20 overflow-hidden min-h-screen flex items-center">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${gymHero})`,
            y: heroY,
            scale: heroScale,
            opacity: 0.25
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30"
          style={{ opacity: heroOpacity }}
        />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-32 left-10 w-20 h-20 rounded-full bg-primary/10 blur-xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-48 right-20 w-32 h-32 rounded-full bg-secondary/10 blur-xl"
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-24 h-24 rounded-full bg-primary/5 blur-lg"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            style={{ opacity: heroOpacity }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Transform Your Body
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Fuel Your Life with Smart Nutrition and Precision Tracking
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
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
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20 relative">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Choose FitLife Gym?
            </h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ParallaxCard delay={0} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Tracking</h3>
              <p className="text-muted-foreground">
                Track your nutrition and calories with AI-powered recommendations tailored to your fitness goals.
              </p>
            </ParallaxCard>

            <ParallaxCard delay={0.15} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Plans</h3>
              <p className="text-muted-foreground">
                Get customized meal plans and workout routines designed specifically for your body and goals.
              </p>
            </ParallaxCard>

            <ParallaxCard delay={0.3} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Visualize your journey with detailed statistics and charts showing your nutrition and fitness progress.
              </p>
            </ParallaxCard>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background relative overflow-hidden">
        <motion.div
          className="absolute -left-32 top-1/2 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [-20, 20, -20] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                About FitLife Gym
              </h2>
              <p className="text-xl text-center text-muted-foreground mb-12">
                Empowering individuals to live healthier, stronger, and smarter lives through innovative fitness technology.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <ParallaxCard delay={0} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  To revolutionize fitness by combining cutting-edge technology with personalized nutrition tracking, making healthy living accessible and achievable for everyone.
                </p>
              </ParallaxCard>

              <ParallaxCard delay={0.1} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community First</h3>
                <p className="text-muted-foreground">
                  We believe in building a supportive community where members motivate each other and celebrate achievements together on their fitness journey.
                </p>
              </ParallaxCard>

              <ParallaxCard delay={0.2} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
                <p className="text-muted-foreground">
                  Our team of certified trainers and nutritionists ensures you receive professional guidance backed by science and proven results.
                </p>
              </ParallaxCard>

              <ParallaxCard delay={0.3} className="p-6 rounded-xl bg-card border border-border hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Technology</h3>
                <p className="text-muted-foreground">
                  Leverage AI-powered recommendations and detailed analytics to optimize your nutrition and track your progress with precision.
                </p>
              </ParallaxCard>
            </div>

            <AnimatedSection>
              <motion.div 
                className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 border border-border"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        <motion.div
          className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Choose Your Plan
              </h2>
              <p className="text-xl text-center text-muted-foreground mb-12">
                Select the perfect membership plan for your fitness journey
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <ParallaxCard
                  key={plan.name}
                  delay={index * 0.15}
                  className={`relative p-8 rounded-xl border transition-all hover:shadow-2xl ${
                    plan.popular
                      ? "border-primary bg-gradient-to-b from-primary/5 to-secondary/5 scale-105"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      Most Popular
                    </motion.div>
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
                    {plan.features.map((feature, i) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </motion.li>
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
                </ParallaxCard>
              ))}
            </div>

            <AnimatedSection className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                All plans include access to our state-of-the-art facilities and equipment
              </p>
              <p className="text-sm text-muted-foreground">
                Need a custom plan for your organization? <a href="#contact" className="text-primary hover:underline">Contact us</a>
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
          animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of members who have already achieved their fitness goals with our smart nutrition tracking and AI recommendations.
            </p>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="secondary" className="shadow-xl">
                  Start Your Journey Now
                </Button>
              </motion.div>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background relative overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 w-72 h-72 rounded-full bg-secondary/5 blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Get In Touch
              </h2>
              <p className="text-xl text-center text-muted-foreground mb-12">
                Have questions? We're here to help you start your fitness journey
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <AnimatedSection>
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
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" variant="hero" className="w-full">
                      Send Message
                    </Button>
                  </motion.div>
                </form>
              </AnimatedSection>

              {/* Contact Information */}
              <div className="space-y-6">
                {[
                  { icon: MapPin, title: "Location", content: "Jl. Fitness Boulevard No. 123\nJakarta Selatan, DKI Jakarta 12345", primary: true },
                  { icon: Phone, title: "Phone", content: "+62 21 1234 5678\n+62 812 3456 7890", primary: false },
                  { icon: Mail, title: "Email", content: "info@fitlifegym.com\nsupport@fitlifegym.com", primary: true },
                  { icon: Clock, title: "Operating Hours", content: "Monday - Friday: 05:00 - 23:00\nSaturday - Sunday: 06:00 - 22:00", primary: false },
                ].map((item, index) => (
                  <ParallaxCard key={item.title} delay={index * 0.1} className="p-6 rounded-xl bg-card border border-border">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${item.primary ? 'bg-primary/10' : 'bg-secondary/10'} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`h-6 w-6 ${item.primary ? 'text-primary' : 'text-secondary'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </ParallaxCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            © 2025 FitLife Gym. Transform Your Body, Fuel Your Life.
          </motion.p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
