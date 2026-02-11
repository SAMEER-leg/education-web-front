import { useState, useEffect } from "react";
import { cn } from "./ui/utils";
import { useSettings } from "../contexts/SettingsContext";
import { Image } from "lucide-react";

export default function Logo({ className, ...props }) {
  const { settings, loading } = useSettings();
  const logoUrl = settings.branding?.logo || settings.logo || "";
  const platformName = settings.branding?.platformName || settings.platformName || "";
  const [imageError, setImageError] = useState(false);

  // Reset image error when logo URL changes
  useEffect(() => {
    if (logoUrl && logoUrl.trim() !== '') {
      setImageError(false);
    }
  }, [logoUrl]);

  // Logo component ready

  // If no logo URL or image failed to load, show a custom modern SVG logo
  if (!logoUrl || logoUrl.trim() === '' || imageError) {
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          className,
        )}
        {...props}
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Main Logo Shape: Geometric Hexagon/Circle Hybrid */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(6,181,204,0.5)]">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b5cc" />
                <stop offset="100%" stopColor="#0d454e" />
              </linearGradient>
            </defs>
            {/* Outer Ring */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.1" />
            <path
              d="M50 5 L95 50 L50 95 L5 50 Z"
              fill="none"
              stroke="url(#logo-grad)"
              strokeWidth="4"
              strokeLinejoin="round"
              className="animate-pulse"
            />
            {/* Central 'S' / Math Symbol Hybrid */}
            <path
              d="M35 35 Q50 20 65 35 Q50 50 35 65 Q50 80 65 65"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[#06b5cc]/20 blur-xl rounded-full -z-10" />
        </div>

        {platformName && (
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hidden sm:block">
            {platformName}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${platformName || 'Platform'} logo`}
      className={cn(
        "object-contain filter brightness-[1.35] saturate-125 contrast-110 drop-shadow-[0_4px_20px_rgba(22,49,98,0.35)]",
        className,
      )}
      onError={() => {
        setImageError(true);
      }}
      {...props}
    />
  );
}

