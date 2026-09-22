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
