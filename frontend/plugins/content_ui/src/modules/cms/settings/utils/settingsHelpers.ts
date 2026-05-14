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

  const trimmedDomain = domain.trim();

  return /^https?:\/\//i.test(trimmedDomain)
    ? trimmedDomain
    : `https://${trimmedDomain}`;
};
