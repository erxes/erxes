import { missingCmsEnvKeys, missingKbEnvKeys, readPortalEnv } from './env';

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

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Тодорхойгүй алдаа гарлаа.';
