import { getI18nConfig } from "emdash";

/**
 * The default locale from the site's Astro `i18n` config, if it names a
 * language this runtime can format. Callers fall back to English when it's
 * undefined.
 */
export function getSiteLocale(): string | undefined {
	const locale = getI18nConfig()?.defaultLocale;
	if (!locale) return undefined;
	try {
		return Intl.DateTimeFormat.supportedLocalesOf(locale)[0];
	} catch {
		// Malformed tags such as "pt_BR" throw instead of matching nothing.
		return undefined;
	}
}

/** Formats a date as YYYY/MM/DD */
export function formatDate(date: Date | string, _month?: "long" | "short"): string {
	const dObj = date instanceof Date ? date : new Date(date);
	const y = dObj.getFullYear();
	const m = String(dObj.getMonth() + 1).padStart(2, "0");
	const d = String(dObj.getDate()).padStart(2, "0");
	return `${y}/${m}/${d}`;
}
