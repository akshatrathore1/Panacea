"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import i18n from "@/lib/i18n";

export default function LanguageToggle() {
  const pathname = usePathname();
  const [lang, setLang] = useState<string>(i18n.language || "en");
  const [hidden, setHidden] = useState<boolean>(false);

  const STORAGE_KEY = "language";

  useEffect(() => {
    const resolveInitialLanguage = () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        return stored || i18n.language || "en";
      } catch {
        return i18n.language || "en";
      }
    };

    const initial = resolveInitialLanguage();
    setLang(initial);

    if (initial !== i18n.language) {
      i18n.changeLanguage(initial);
    }

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", initial);
    }

    let observer: MutationObserver | null = null;

    const evaluateTogglePresence = () => {
      if (typeof document === "undefined") return;
      const localToggle = document.querySelector("[data-local-language-toggle]");
      setHidden(Boolean(localToggle));
    };

    evaluateTogglePresence();

    if (typeof document !== "undefined") {
      observer = new MutationObserver(() => evaluateTogglePresence());
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
    };
  }, [pathname]);

  const toggle = () => {
    const next = lang === "en" ? "hi" : "en";
    i18n.changeLanguage(next);
    setLang(next);
    try {
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
      if (typeof document !== "undefined") document.documentElement.setAttribute("lang", next);
    } catch { }
  };

  const targetLabel = lang === "en" ? "हिंदी" : "English";

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-medium text-gray-800 shadow-lg ring-1 ring-gray-200 hover:bg-white"
    >
      <Globe className="h-4 w-4" />
      {targetLabel}
    </button>
  );
}
