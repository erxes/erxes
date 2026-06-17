/**
 * Tenant resolution for the Studio bridge.
 *
 * Importing `~/connectionResolvers` runs `createGenerateModels(...)`, which calls
 * `connect()` against MONGO_URL — so the mongoose connection is established as a
 * side effect of this import. Studio therefore needs the SAME reachable MONGO_URL
 * erxes uses.
 *
 * - non-saas (VERSION != 'saas'): reads the DB in MONGO_URL; subdomain defaults
 *   to 'os' — the same value getMastraMemory uses for tenant-scoped recall.
 * - saas: set ERXES_STUDIO_SUBDOMAIN to a real org subdomain.
 */
import { generateModels, type IModels } from '~/connectionResolvers';

export const STUDIO_SUBDOMAIN = (
  process.env.ERXES_STUDIO_SUBDOMAIN || 'os'
).trim();

let cache: Promise<IModels> | null = null;

export function studioModels(): Promise<IModels> {
  if (!cache) cache = generateModels(STUDIO_SUBDOMAIN);
  return cache;
}
