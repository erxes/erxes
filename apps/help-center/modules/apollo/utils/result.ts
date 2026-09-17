export type PortalResult<T> =
  | { state: 'ready'; data: T }
  | { state: 'unconfigured'; missing: string[] }
  | { state: 'unpublished'; domain: string }
  | { state: 'error'; message: string };

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unknown error occurred.';

export const errorBodyMatches = (error: unknown, pattern: RegExp): boolean => {
  if (pattern.test(errorMessage(error))) {
    return true;
  }

  const { bodyText } = (error ?? {}) as { bodyText?: unknown };

  return typeof bodyText === 'string' && pattern.test(bodyText);
};

export const graphqlErrorMessage = (caught: unknown): string => {
  if (caught && typeof caught === 'object' && 'errors' in caught) {
    const { errors } = caught as { errors?: { message?: string }[] };
    const first = errors?.[0]?.message;

    if (first) {
      return first;
    }
  }

  return caught instanceof Error ? caught.message : '';
};
