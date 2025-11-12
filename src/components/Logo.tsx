import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 hero-gradient opacity-20 blur-xl rounded-full" />
        <Brain className="w-8 h-8 text-primary relative z-10" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          NeuroNotes
        </span>
      )}
    </div>
  );
};
