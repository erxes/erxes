import { readFileSync } from 'node:fs';

const isProduction = process.env.NODE_ENV === 'production';

/** A secret from NAME or the file named by NAME_FILE. */
const readSecret = (name: string): string | undefined => {
  const file = process.env[`${name}_FILE`];

  if (file) {
    return readFileSync(file, 'utf8').trim() || undefined;
  }

  return process.env[name]?.trim() || undefined;
};

const readNumber = (name: string, fallback: number): number => {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const required = (name: string, value: string | undefined, devDefault: string) => {
  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} (or ${name}_FILE) must be set in production`);
  }

  return devDefault;
};

export const config = {
  isProduction,
  port: readNumber('PORT', 3400),
  data: {
    url: required(
      'DATA_URL',
      readSecret('DATA_URL'),
      'postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes',
    ),
    ssl: process.env.DATA_SSL === 'true',
    poolMax: readNumber('DATA_POOL_MAX', 10),
    statementTimeoutMs: readNumber('DATA_STATEMENT_TIMEOUT_MS', 15_000),
  },
  setup: {
    /**
     * First-run setup (create the first organisation and owner from the UI)
     * while the database has none. Off where the SaaS side creates organisations.
     */
    enabled: process.env.CORE_SETUP !== 'false',
  },
  auth: {
    jwtSecret: required(
      'CORE_JWT_SECRET',
      readSecret('CORE_JWT_SECRET'),
      'erxes-core-local-development-secret',
    ),
    accessTokenTtlSeconds: readNumber('CORE_ACCESS_TOKEN_TTL_SECONDS', 3600),
    /** Browser session (HttpOnly cookie) length. */
    sessionHours: readNumber('CORE_SESSION_HOURS', 12),
    /**
     * Organisation used for sign-in when neither the address nor the request
     * names one (self-hosted single organisation, local development).
     */
    defaultSubdomain: process.env.DEFAULT_SUBDOMAIN?.trim().toLowerCase() || undefined,
  },
};
