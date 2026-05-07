export const languageLabel = (language: string) => {
  const labels: Record<string, string> = {
    en: 'English',
    mn: 'Mongolian',
  };

  return labels[language] || language.toUpperCase();
};

export const buildPublicUrl = (domain?: string) => {
  if (!domain) {
    return '';
  }

  return /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
};
