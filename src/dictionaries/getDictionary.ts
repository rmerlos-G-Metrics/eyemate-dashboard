import 'server-only'

const dictionaries = {
    en: () => import('./en.json').then((module) => module.default),
    de: () => import('./de.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
    //Fallback to English
    return dictionaries[locale]?.() ?? dictionaries.en();
}