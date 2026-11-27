import type { PluginAccess } from '@erxes/core-contract';
import {
  openScope,
  PLUGIN_ACCESS,
  serverLicense,
  type StoredPluginManifest,
  type Transaction,
  withSystem,
} from '@erxes/core-db';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { logger } from '~/logger';

const log = logger.child({ component: 'license' });

/** After a license ends, the plugins it named read for this many days, then stop. */
export const GRACE_DAYS = 14;

const DAY = 24 * 60 * 60 * 1000;

/** How long a process keeps the activated license it read before reading it again. */
const STORED_TTL_MS = 60_000;

/**
 * What an erxes license says: whom it is for (`sub`, and erxes.io's name for the customer), the
 * plugins it covers, and the day it ends (`until`, not `exp`: an ended license still says which
 * plugins read during the grace).
 */
const LicenseClaims = z.object({
  sub: z.string().min(1),
  name: z.string().min(1).optional(),
  plugins: z.array(z.string().min(1)).min(1),
  until: z.iso.datetime(),
});

export interface License {
  customer: string;
  plugins: string[];
  until: Date;
}

/** The license a token is, verified with erxes' keys built into core; null when it isn't one. */
export const verifyLicense = async (token: string): Promise<License | null> => {
  try {
    const { payload } = await jwtVerify(
      token,
      createLocalJWKSet({ keys: [...config.license.keys] }),
      {
        algorithms: ['ES256'],
        issuer: 'erxes',
        typ: 'erxes-license+jwt',
      },
    );

    const claims = LicenseClaims.parse(payload);

    return {
      customer: claims.name ?? claims.sub,
      plugins: claims.plugins,
      until: new Date(claims.until),
    };
  } catch (error) {
    log.warn({ err: error }, 'an erxes license does not verify: plugins that need one stay off');

    return null;
  }
};

/**
 * Where the server's license comes from: `ERXES_LICENSE`, given by hand, wins over the activation
 * key, with which core fetches it from erxes.io.
 */
export const licenseSource = () => {
  if (config.license.token) return 'file';

  return config.license.activationKey ? 'activation' : null;
};

type StoredLicense = typeof serverLicense.$inferSelect;

let stored: { at: number; row: Promise<StoredLicense | null> } | null = null;

const readStored = async (tx: Transaction) =>
  (await tx.select().from(serverLicense).limit(1))[0] ?? null;

/**
 * The license core last fetched from erxes.io, and how that went; read once a minute per process.
 * The row is the deployment's, not an organisation's, so a request reads it in its own scope.
 */
export const storedLicense = () => {
  if (!stored || Date.now() - stored.at > STORED_TTL_MS) {
    const scope = openScope();
    const row = scope ? readStored(scope.tx) : withSystem('erxes license', readStored);

    // A failed read is read again on the next call, not remembered for a minute.
    row.catch(() => {
      stored = null;
    });
    stored = { at: Date.now(), row };
  }

  return stored.row;
};

/** Forgets the license this process read, after a new one is stored. */
export const forgetStoredLicense = () => {
  stored = null;
};

/** The verified license for the token and keys in force; verified once per pair. */
let verified: { token: string; keys: unknown; license: Promise<License | null> } | null = null;

/** The server's erxes license, or null without a valid one. */
export const currentLicense = async () => {
  const source = licenseSource();
  const token = source === 'file' ? config.license.token : source && (await storedLicense())?.token;

  if (!token) return null;

  const { keys } = config.license;

  if (verified?.token !== token || verified.keys !== keys) {
    verified = { token, keys, license: verifyLicense(token) };
  }

  return verified.license;
};

/**
 * What a plugin may do on this server by its license. Only a plugin whose manifest says
 * `requiresLicense` needs one, and only self-hosted: on erxes.io the plan decides. Named and
 * in force: `full`; ended: `read_only` for the grace days, then `off`; not named: `off`.
 */
export const licenseAccess = async (
  name: string,
  manifest: Pick<StoredPluginManifest, 'requiresLicense'> | null | undefined,
  now = new Date(),
): Promise<PluginAccess> => {
  if (config.saas.enabled || !manifest?.requiresLicense) return 'full';

  const license = await currentLicense();

  if (!license?.plugins.includes(name)) return 'off';

  if (now < license.until) return 'full';

  return now.getTime() < license.until.getTime() + GRACE_DAYS * DAY ? 'read_only' : 'off';
};

/** The stricter of two accesses: a plugin may do only what both allow. */
export const stricter = (a: PluginAccess, b: PluginAccess): PluginAccess =>
  PLUGIN_ACCESS.indexOf(a) > PLUGIN_ACCESS.indexOf(b) ? a : b;

/** Why a plugin's manifest won't run here, for `registerManifest`'s warnings; none when it will. */
export const licenseWarnings = async (
  name: string,
  manifest: Pick<StoredPluginManifest, 'requiresLicense'>,
) => {
  const access = await licenseAccess(name, manifest);

  if (access === 'off') {
    return [
      `${name} needs an erxes license that names it: set ERXES_ACTIVATION_KEY (or ERXES_LICENSE) on core`,
    ];
  }

  if (access === 'read_only') return [`${name}'s erxes license has ended: it only reads now`];

  return [];
};
