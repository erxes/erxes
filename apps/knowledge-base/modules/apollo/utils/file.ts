import { readPortalEnv } from './env';

/**
 * erxes stores an upload as a bare key ("office-erxes-io/abc123photo.png") and
 * serves it back through the API's `read-file` endpoint. A value that is
 * already a URL — pasted in, or served from elsewhere — is handed back
 * untouched, so both shapes work wherever a stored image is rendered.
 */
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
