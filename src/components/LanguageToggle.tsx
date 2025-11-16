"use client";

import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/hooks/useLanguage";

type LanguageToggleProps = {
  className?: string;
  variant?: "default" | "ghost" | "inverted";
};

export default function LanguageToggle({ className, variant = "default" }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();
  const targetLabel = language === "en" ? "हिंदी" : "English";

  const baseClasses =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2";

  const variantConfig = (() => {
    switch (variant) {
      case "ghost":
        return {
          button: "border border-white/60 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white",
          icon: "text-white"
        };
      case "inverted":
        return {
          button: "border border-transparent bg-white text-gray-900 shadow-sm hover:bg-white focus-visible:ring-white/80",
          icon: "text-gray-900"
        };
      default:
        return {
          button: "border border-gray-300 bg-transparent text-gray-900 hover:bg-white/60 focus-visible:ring-gray-400",
          icon: "text-gray-900"
        };
    }
  })();

  const classes = [baseClasses, variantConfig.button, className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={classes}
    >
      <GlobeAltIcon className={`h-4 w-4 ${variantConfig.icon}`} />
      <span>{targetLabel}</span>
    </button>
  );
}
