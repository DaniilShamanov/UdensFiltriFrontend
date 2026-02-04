export const locales = ["lv", "ru", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "lv";

// Pathnames can be defined later if translated URLs required.
export const localePrefix = "as-needed" as const;
