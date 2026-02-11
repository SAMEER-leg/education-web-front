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

  // If no logo URL, show variant 3 image
  if (!logoUrl || logoUrl.trim() === '' || imageError) {
    return (
      <div
        className={cn(
          "flex items-center gap-3",
          className,
        )}
        {...props}
      >
        <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
          <img
            src="/logo.png"
            alt="StudySouq Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(6,181,204,0.7)] hover:scale-110 transition-transform duration-300 pointer-events-none"
            onError={(e) => {
              console.error("Local logo failed to load", e);
            }}
          />
          <div className="absolute inset-0 bg-[#06b5cc]/15 blur-xl rounded-full -z-10 animate-pulse" />
        </div>

        {platformName && (
          <span className="font-extrabold text-xl md:text-2xl tracking-tighter bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent hidden sm:block whitespace-nowrap">
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

