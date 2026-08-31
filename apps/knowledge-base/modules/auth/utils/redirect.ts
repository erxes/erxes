/**
 * Where a guarded route sends the visitor back to once they have signed in.
 * Only a path inside the portal is ever honoured, so a crafted `?next=` cannot
 * bounce someone onto another origin straight after they typed their password.
 */
export const internalPath = (
  value: string | string[] | undefined,
): string | null => {
  const path = Array.isArray(value) ? value[0] : value;

  if (
    !path ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.startsWith('/\\')
  ) {
    return null;
  }

  return path;
};

export const withNext = (path: string, next: string | null): string =>
  next ? `${path}?next=${encodeURIComponent(next)}` : path;
