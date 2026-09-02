const DUPLICATE_KEY_CODE = 11000;

export const isDuplicateKeyError = (e: unknown, field?: string) => {
  const error = e as { code?: number; keyPattern?: Record<string, unknown> };

  if (error?.code !== DUPLICATE_KEY_CODE) {
    return false;
  }

  return field ? Boolean(error.keyPattern?.[field]) : true;
};
