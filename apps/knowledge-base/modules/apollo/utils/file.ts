import { readPortalEnv } from './env';

export const storedFileUrl = (value: string | null): string | null => {
  const key = value?.trim();

  if (!key) {
    return null;
  }

  if (/^(https?:)?\/\//i.test(key) || key.startsWith('/')) {
    return key;
  }

  const { apiUrl } = readPortalEnv();

  if (!apiUrl) {
    return null;
  }

  return `${apiUrl}/read-file?key=${encodeURIComponent(key)}`;
};
