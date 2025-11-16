"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "@/lib/i18n";
import {
    LanguageCode,
    normalizeLanguage,
    persistLanguage,
    readStoredLanguage
} from "@/lib/language";

export const useLanguage = () => {
    const [language, setLanguageState] = useState<LanguageCode>(() =>
        readStoredLanguage(normalizeLanguage(i18n.language))
    );

    useEffect(() => {
        const handleLanguageChange = (next: string) => {
            const normalized = normalizeLanguage(next);
            persistLanguage(normalized);
            setLanguageState(normalized);
        };

        handleLanguageChange(i18n.language);

        i18n.on("languageChanged", handleLanguageChange);
        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };
    }, []);

    const setLanguage = useCallback((next: LanguageCode) => {
        const normalized = normalizeLanguage(next);
        if (normalized === i18n.language) {
            persistLanguage(normalized);
            setLanguageState(normalized);
            return;
        }

        i18n
            .changeLanguage(normalized)
            .then(() => {
                persistLanguage(normalized);
                setLanguageState(normalized);
            })
            .catch((error) => {
                console.error("Failed to change language", error);
            });
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === "en" ? "hi" : "en");
    }, [language, setLanguage]);

    return useMemo(
        () => ({
            language,
            setLanguage,
            toggleLanguage
        }),
        [language, setLanguage, toggleLanguage]
    );
};
