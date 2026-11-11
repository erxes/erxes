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

/**
 * Plugin client secrets: `hr:<secret>,ecom:<secret>`. At startup they are
 * registered in `core_plugins` (hashed). A plugin exchanges its secret for
 * short-lived tokens (`POST /core/v1/plugins/token`); the secret itself is
 * never accepted on API calls. `pnpm plugin:secret <name>` rotates one.
 */
const readPluginKeys = (): Map<string, string> => {
  const keys = new Map<string, string>();

  for (const entry of (readSecret('CORE_PLUGIN_KEYS') ?? '').split(',')) {
    const separator = entry.indexOf(':');
    const name = entry.slice(0, separator).trim().toLowerCase();
    const secret = entry.slice(separator + 1).trim();

    if (separator < 1 || !secret) {
      continue;
    }

    if (!/^[a-z][a-z0-9_]{0,39}$/.test(name) || name === 'core') {
      throw new Error(`CORE_PLUGIN_KEYS: "${name}" is not a valid plugin name`);
    }

    if (secret.length < 32) {
      throw new Error(`CORE_PLUGIN_KEYS: the key for "${name}" must be at least 32 characters`);
    }

    keys.set(secret, name);
  }

  return keys;
};

const storageName = process.env.FILES_STORAGE?.trim().toLowerCase() || 'local';
const storageDriver = (['local', 's3'] as const).find((driver) => driver === storageName);

if (!storageDriver) {
  throw new Error('FILES_STORAGE must be "local" or "s3"');
}

/**
 * Where to LISTEN for live updates: a connection that stays open (Postgres
 * directly, or Supabase's session pooler on 5432). A transaction pooler
 * (Supabase 6543, PgBouncer in transaction mode) can't deliver notifications,
 * so for Supabase's the session pooler on the same host is used.
 */
const listenUrl = (dataUrl: string): string | undefined => {
  const explicit = readSecret('DATA_LISTEN_URL');

  if (explicit) {
    return explicit === 'off' ? undefined : explicit;
  }

  try {
    const url = new URL(dataUrl);

    if (url.port === '6543') {
      if (!url.hostname.endsWith('.pooler.supabase.com')) return undefined;

      url.port = '5432';
    }

    return url.toString();
  } catch {
    return undefined;
  }
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
    /** CA for the Postgres certificate (PEM), e.g. Supabase's root CA. */
    sslCa: readSecret('DATA_SSL_CA'),
    /** Skip certificate verification: development only (refused in production). */
    sslInsecure: process.env.DATA_SSL_INSECURE === 'true',
    poolMax: readNumber('DATA_POOL_MAX', 10),
    statementTimeoutMs: readNumber('DATA_STATEMENT_TIMEOUT_MS', 15_000),
  },
  live: {
    /** `DATA_LISTEN_URL` (or derived from DATA_URL); `off` turns live updates off. */
    listenUrl: undefined as string | undefined,
    /** Open streams a member may have at once (browsers share one across tabs). */
    maxStreamsPerUser: readNumber('LIVE_MAX_STREAMS_PER_USER', 10),
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
    /**
     * Core's signing key (EC P-256, PKCS#8 PEM): plugin tokens and audit
     * checkpoints, verified by anyone with the public keys at
     * `/core/v1/.well-known/jwks.json`. Without it, development generates one
     * and keeps it in `signingKeyFile`; production requires it.
     */
    signingKey: readSecret('CORE_SIGNING_KEY'),
    signingKeyFile: process.env.CORE_SIGNING_KEY_DEV_FILE?.trim() || './data/keys/signing-key.pem',
    /** Previous keys (PEM, public or private), still published so older signatures verify. */
    retiredSigningKeys: readSecret('CORE_SIGNING_KEYS_RETIRED'),
  },
  /** Secret → plugin name. */
  pluginKeys: readPluginKeys(),
  plugins: {
    /**
     * Install every plugin in every organisation (new plugins once, new
     * organisations at creation). On for self-hosted and development; off
     * where the SaaS side decides what each organisation has.
     */
    autoInstall:
      (process.env.PLUGINS_AUTO_INSTALL ??
        (process.env.CORE_SETUP === 'false' ? 'false' : 'true')) === 'true',
  },
  files: {
    /** `local` (a folder on this server) or `s3` (AWS S3, Cloudflare R2, MinIO, …). */
    driver: storageDriver,
    localDir: process.env.FILES_LOCAL_DIR?.trim() || './data/files',
    s3: {
      bucket: process.env.S3_BUCKET?.trim() ?? '',
      region: process.env.S3_REGION?.trim() || 'auto',
      /** R2 / MinIO address; empty for AWS. */
      endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
      accessKeyId: readSecret('S3_ACCESS_KEY_ID'),
      secretAccessKey: readSecret('S3_SECRET_ACCESS_KEY'),
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    },
    /** The deployment's limit; organisations can only lower it. */
    maxSizeMb: readNumber('FILES_MAX_SIZE_MB', 50),
    /** How long upload and download links work. */
    linkTtlSeconds: readNumber('FILES_LINK_TTL_SECONDS', 300),
    /** Uploads granted but never finished are removed after this long. */
    pendingTtlHours: readNumber('FILES_PENDING_TTL_HOURS', 24),
  },
  retention: {
    /** Audit log entries older than this are deleted. */
    auditDays: readNumber('AUDIT_RETENTION_DAYS', 365),
    /** Read notifications older than this are deleted. */
    readNotificationDays: readNumber('NOTIFICATIONS_RETENTION_DAYS', 90),
    /** Events are kept this long once every consumer has handled them. */
    eventDays: readNumber('EVENTS_RETENTION_DAYS', 30),
  },
};

if (isProduction && config.data.sslInsecure) {
  throw new Error(
    'DATA_SSL_INSECURE is for development only: give the database CA with DATA_SSL_CA(_FILE)',
  );
}

if (isProduction && !config.auth.signingKey) {
  throw new Error(
    'CORE_SIGNING_KEY (or CORE_SIGNING_KEY_FILE) must be set in production: openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256',
  );
}

if (config.files.driver === 's3' && !config.files.s3.bucket) {
  throw new Error('FILES_STORAGE=s3 needs S3_BUCKET');
}

config.live.listenUrl = listenUrl(config.data.url);
