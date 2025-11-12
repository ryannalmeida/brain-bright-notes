import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      
      {/* Footer */}
      <footer className="py-8 border-t border-border bg-muted/30">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 NeuroNotes. Built with ❤️ using AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
