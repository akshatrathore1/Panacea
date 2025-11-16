export type LanguageCode = "en" | "hi";
export const LANGUAGE_STORAGE_KEY = "krashiaalok-language";

export const normalizeLanguage = (value: string | null | undefined): LanguageCode => {
    return value === "hi" ? "hi" : "en";
};

export const readStoredLanguage = (fallback: LanguageCode): LanguageCode => {
    if (typeof window === "undefined") return fallback;

    try {
        const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored) return normalizeLanguage(stored);
    } catch {
        // ignore storage read errors
    }

    if (typeof navigator !== "undefined" && navigator.language?.startsWith("hi")) {
        return "hi";
    }

    return fallback;
};

export const persistLanguage = (lang: LanguageCode) => {
    try {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        }
    } catch {
        // ignore storage write errors
    }

    if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
    }
};
