"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import i18n from "@/lib/i18n";

export default function LanguageToggle() {
  const [lang, setLang] = useState<string>(i18n.language || "en");

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
      const initial = stored || i18n.language || "en";
      if (initial !== i18n.language) {
        i18n.changeLanguage(initial);
      }
      setLang(initial);
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", initial);
      }
    } catch {}
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "hi" : "en";
    i18n.changeLanguage(next);
    setLang(next);
    try {
      if (typeof window !== "undefined") localStorage.setItem("lang", next);
      if (typeof document !== "undefined") document.documentElement.setAttribute("lang", next);
    } catch {}
  };

  const targetLabel = lang === "en" ? "हिंदी" : "English";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-medium text-gray-800 shadow-lg ring-1 ring-gray-200 hover:bg-white"
    >
      <Globe className="h-4 w-4" />
      {targetLabel}
    </button>
  );
}
