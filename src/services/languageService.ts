import type { SupportedLanguage } from '../types/analysis';

type FrancFn = (input: string, options?: { minLength?: number }) => string;

const langMap: Record<string, SupportedLanguage> = {
  swe: 'sv',
  nor: 'no',
  nob: 'no',
  nno: 'no',
  dan: 'da',
  fin: 'fi',
  est: 'fi',
  eng: 'en'
};

let francLoader: FrancFn | null = null;

const loadFranc = async (): Promise<FrancFn> => {
  if (!francLoader) {
    const module = await import('franc-min');
    francLoader = module.franc;
  }
  return francLoader;
};

export const detectLanguage = async (text: string): Promise<SupportedLanguage> => {
  if (!text || text.length < 20) {
    return 'en';
  }
  const franc = await loadFranc();
  const detected = franc(text, { minLength: 20 });
  return langMap[detected] ?? 'en';
};
