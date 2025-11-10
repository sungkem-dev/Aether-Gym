import { Navbar } from "@/components/Navbar";
import { Heart, Users, Award, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
              About FitLife Gym
            </h1>
            <p className="text-xl text-center text-muted-foreground mb-12 animate-fade-in">
              Empowering individuals to live healthier, stronger, and smarter lives through innovative fitness technology.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="p-6 rounded-xl bg-card border border-border animate-slide-up">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  To revolutionize fitness by combining cutting-edge technology with personalized nutrition tracking, making healthy living accessible and achievable for everyone.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community First</h3>
                <p className="text-muted-foreground">
                  We believe in building a supportive community where members motivate each other and celebrate achievements together on their fitness journey.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
                <p className="text-muted-foreground">
                  Our team of certified trainers and nutritionists ensures you receive professional guidance backed by science and proven results.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border animate-slide-up" style={{ animationDelay: "0.3s" }}>
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
              <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
              <p className="text-muted-foreground mb-4">
                At FitLife Gym, we understand that true fitness isn't just about working out—it's about nourishing your body with the right nutrition and tracking your progress intelligently. That's why we've created a comprehensive platform that combines:
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
      </div>
    </div>
  );
};

export default About;
