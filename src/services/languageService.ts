import { franc } from 'franc-min';
import { SupportedLanguage } from '../types/analysis';

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

export const detectLanguage = (text: string): SupportedLanguage => {
  if (!text || text.length < 10) {
    return 'sv';
  }
  const detected = franc(text, { minLength: 10 });
  return langMap[detected] ?? 'sv';
};
