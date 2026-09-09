export type PortalResult<T> =
  | { state: 'ready'; data: T }
  | { state: 'unconfigured'; missing: string[] }
  /* The portal is wired up, but no help center claims this domain yet. */
  | { state: 'unpublished'; domain: string }
  | { state: 'error'; message: string };

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unknown error occurred.';

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
