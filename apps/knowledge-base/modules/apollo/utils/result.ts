import {
  missingCmsEnvKeys,
  missingFormEnvKeys,
  missingKbEnvKeys,
  readFormEnv,
  readPortalEnv,
} from './env';

export type PortalResult<T> =
  | { state: 'ready'; data: T }
  | { state: 'unconfigured'; missing: string[] }
  | { state: 'error'; message: string };

const gate = <T>(missing: string[]): PortalResult<T> | null =>
  missing.length ? { state: 'unconfigured', missing } : null;

export const kbGate = <T>(): PortalResult<T> | null =>
  gate<T>(missingKbEnvKeys(readPortalEnv()));

export const cmsGate = <T>(): PortalResult<T> | null =>
  gate<T>(missingCmsEnvKeys(readPortalEnv()));

export const formsGate = <T>(): PortalResult<T> | null =>
  gate<T>(missingFormEnvKeys(readPortalEnv(), readFormEnv()));

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Тодорхойгүй алдаа гарлаа.';

/**
 * Apollo hands a failure over either as a thrown error or as a response
 * carrying `errors`, so the server's own wording is read out of both.
 */
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
