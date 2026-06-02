import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Menu, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  // Auth state drives the right-side CTA buttons
  const { user, isMember, isAdmin, loading, membershipLoading } = useAuthContext();

  const scrollToSection = (sectionId: string) => {
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
    setIsOpen(false);
  };

  // Scroll-based nav items (Pricing is a dedicated page, not a hash)
  const scrollNavItems = [
    { id: "home",    label: "Home" },
    { id: "about",   label: "About" },
    { id: "contact", label: "Contact" },
  ];

  // ─── Right-side CTA logic ─────────────────────────────────────────────────
  //
  //   NOT logged in            → Login button + Join Now button
  //   Logged in, NO membership → "Join Now" → /pricing  (no Login button)
  //   Logged in, HAS membership→ "Dashboard" → /dashboard  (no Login button)
  //
  // While session or membership is loading, show a tiny spinner to avoid
  // flashing the wrong buttons during hydration.

  const isResolvingAuth = loading || (!!user && membershipLoading);
  const isActiveMember  = isMember || isAdmin;

  const renderDesktopCTA = () => {
    if (isResolvingAuth) {
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }

    if (!user) {
      // Not logged in
      return (
        <>
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="hero">Join Now</Button>
          </Link>
        </>
      );
    }

    if (isActiveMember) {
      // Logged in + active membership
      return (
        <Link to="/dashboard">
          <Button variant="hero">Dashboard</Button>
        </Link>
      );
    }

    // Logged in but no membership yet
    return (
      <Link to="/pricing">
        <Button variant="hero">Join Now</Button>
      </Link>
    );
  };

  const renderMobileCTA = () => {
    if (isResolvingAuth) return null;

    if (!user) {
      return (
        <div className="space-y-2 pt-4 border-t border-border">
          <Link to="/login" onClick={() => setIsOpen(false)}>
            <Button variant="outline" className="w-full">Login</Button>
          </Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>
            <Button variant="hero" className="w-full">Join Now</Button>
          </Link>
        </div>
      );
    }

    if (isActiveMember) {
      return (
        <div className="pt-4 border-t border-border">
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>
            <Button variant="hero" className="w-full">Dashboard</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="pt-4 border-t border-border">
        <Link to="/pricing" onClick={() => setIsOpen(false)}>
          <Button variant="hero" className="w-full">Join Now</Button>
        </Link>
      </div>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center space-x-2 group"
          >
            <Dumbbell className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AetherGym
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {scrollNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}

            {/* Pricing → standalone page */}
            <Link
              to="/pricing"
              className="text-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>

            {/* Dynamic auth CTAs */}
            {renderDesktopCTA()}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            {scrollNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}

            <Link
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2 text-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>

            {/* Dynamic mobile CTAs */}
            {renderMobileCTA()}
          </div>
        )}
      </div>
    </nav>
  );
};
