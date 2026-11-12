import { readFileSync } from 'node:fs';
import { z } from 'zod';

/** Settings that may also come from a file named by `<NAME>_FILE` (Docker and Kubernetes secrets). */
const SECRETS = [
  'DATA_URL',
  'DATA_MIGRATION_URL',
  'DATA_LISTEN_URL',
  'DATA_SSL_CA',
  'CORE_JWT_SECRET',
  'CORE_SIGNING_KEY',
  'CORE_SIGNING_KEYS_RETIRED',
  'CORE_ENCRYPTION_KEY',
  'CORE_PLUGIN_KEYS',
  'EMAIL_SMTP_URL',
  'SAAS_PLATFORM_TOKEN',
  'SAAS_JWT_TOKEN_SECRET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
] as const;

const readSecret = (name: string) => {
  const file = process.env[`${name}_FILE`];

  return file ? readFileSync(file, 'utf8') : process.env[name];
};

/** Blank counts as unset; values are trimmed. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || undefined : value),
    schema.optional(),
  );

const text = optional(z.string());

const flag = optional(z.enum(['true', 'false']).transform((value) => value === 'true'));

const positive = (fallback: number) =>
  optional(z.coerce.number().positive()).transform((value) => value ?? fallback);

const baseUrl = (fallback: string) =>
  optional(z.string().url())
    .transform((value) => value ?? fallback)
    .transform((value) => value.replace(/\/+$/, ''));

const PLUGIN_NAME = /^[a-z][a-z0-9_]{0,39}$/;

/**
 * Plugin client secrets, `hr:<secret>,ecom:<secret>`, as secret → plugin name.
 * They are registered (hashed) in `core_plugins` at startup; a plugin trades
 * its secret for short-lived tokens (`POST /core/v1/plugins/token`) and never
 * sends it on API calls. `pnpm plugin:secret <name>` rotates one.
 */
const pluginKeys = optional(z.string()).transform((value, ctx) => {
  const keys = new Map<string, string>();

  for (const entry of (value ?? '').split(',')) {
    const separator = entry.indexOf(':');
    const name = entry.slice(0, separator).trim().toLowerCase();
    const secret = entry.slice(separator + 1).trim();

    if (separator < 1 || !secret) continue;

    if (!PLUGIN_NAME.test(name) || name === 'core') {
      ctx.addIssue({ code: 'custom', message: `"${name}" is not a valid plugin name` });
    } else if (secret.length < 32) {
      ctx.addIssue({
        code: 'custom',
        message: `the key for "${name}" needs 32 characters or more`,
      });
    } else {
      keys.set(secret, name);
    }
  }

  return keys;
});

const Env = z
  .object({
    NODE_ENV: text,
    PORT: positive(3400),

    LOG_LEVEL: optional(z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])),
    LOG_FORMAT: optional(z.enum(['json', 'pretty'])),
    OTEL_EXPORTER_OTLP_ENDPOINT: optional(z.string().url()),

    DATA_URL: text,
    DATA_MIGRATION_URL: text,
    DATA_RUNTIME_ROLE: text,
    DATA_LISTEN_URL: text,
    DATA_SSL: flag,
    DATA_SSL_CA: text,
    DATA_SSL_INSECURE: flag,
    DATA_POOL_MAX: positive(10),
    DATA_MIGRATE_ON_START: flag,
    DATA_ROLE: text,
    DATA_STATEMENT_TIMEOUT_MS: positive(15_000),

    LIVE_MAX_STREAMS_PER_USER: positive(10),
    CORE_SETUP: flag,

    CORE_JWT_SECRET: text,
    CORE_ACCESS_TOKEN_TTL_SECONDS: positive(3600),
    CORE_SESSION_HOURS: positive(12),
    DEFAULT_SUBDOMAIN: optional(z.string().toLowerCase()),
    FAILED_SIGN_IN_ALERT: positive(10),
    CORE_SIGNING_KEY: text,
    CORE_SIGNING_KEY_DEV_FILE: text,
    CORE_SIGNING_KEYS_RETIRED: text,
    CORE_ENCRYPTION_KEY: text,
    CORE_PLUGIN_KEYS: pluginKeys,
    PLUGINS_AUTO_INSTALL: flag,

    APP_URL: baseUrl('http://localhost:3500'),

    EMAIL_DRIVER: optional(z.enum(['smtp', 'log'])),
    EMAIL_SMTP_URL: text,
    EMAIL_FROM: text,

    OUTBOUND_ALLOW_PRIVATE: flag,

    SAAS: flag,
    SAAS_PLATFORM_URL: baseUrl('https://erxes.io'),
    SAAS_PLATFORM_TOKEN: text,
    SAAS_JWT_TOKEN_SECRET: text,
    SAAS_GRACE_DAYS: positive(7),
    SAAS_BILLING_URL: text,

    FILES_STORAGE: optional(
      z
        .string()
        .toLowerCase()
        .pipe(z.enum(['local', 's3'])),
    ),
    FILES_LOCAL_DIR: text,
    FILES_MAX_SIZE_MB: positive(50),
    FILES_LINK_TTL_SECONDS: positive(300),
    FILES_PENDING_TTL_HOURS: positive(24),
    S3_BUCKET: text,
    S3_REGION: text,
    S3_ENDPOINT: text,
    S3_ACCESS_KEY_ID: text,
    S3_SECRET_ACCESS_KEY: text,
    S3_FORCE_PATH_STYLE: flag,

    AUDIT_RETENTION_DAYS: positive(365),
    NOTIFICATIONS_RETENTION_DAYS: positive(90),
    EVENTS_RETENTION_DAYS: positive(30),
    AUTOMATION_RUN_DETAILS_RETENTION_DAYS: positive(90),

    MASS_DELETE_ALERT: positive(100),
    MASS_DELETE_LIMIT: positive(500),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;

    const problem = (message: string) => ctx.addIssue({ code: 'custom', message });

    if (!env.DATA_URL) problem('DATA_URL (or DATA_URL_FILE) must be set in production');

    if (!env.CORE_JWT_SECRET) {
      problem('CORE_JWT_SECRET (or CORE_JWT_SECRET_FILE) must be set in production');
    }

    if (!env.CORE_SIGNING_KEY) {
      problem(
        'CORE_SIGNING_KEY (or CORE_SIGNING_KEY_FILE) must be set in production: openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256',
      );
    }

    if (env.DATA_SSL_INSECURE) {
      problem(
        'DATA_SSL_INSECURE is for development only: give the database CA with DATA_SSL_CA(_FILE)',
      );
    }
  })
  .superRefine((env, ctx) => {
    if (env.SAAS && (env.SAAS_PLATFORM_TOKEN?.length ?? 0) < 32) {
      ctx.addIssue({
        code: 'custom',
        message:
          "SAAS=true needs SAAS_PLATFORM_TOKEN (at least 32 characters; erxes.io's PLATFORM_API_TOKEN)",
      });
    }

    if (env.FILES_STORAGE === 's3' && !env.S3_BUCKET) {
      ctx.addIssue({ code: 'custom', message: 'FILES_STORAGE=s3 needs S3_BUCKET' });
    }
  });

const parsed = Env.safeParse({
  ...process.env,
  ...Object.fromEntries(SECRETS.map((name) => [name, readSecret(name)])),
});

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) =>
    issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
  );

  throw new Error(`Invalid settings:\n  ${problems.join('\n  ')}`);
}

const env = parsed.data;
const isProduction = env.NODE_ENV === 'production';
const dataUrl = env.DATA_URL ?? 'postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes';

/**
 * Where to LISTEN for live updates: a connection that stays open (Postgres
 * directly, or Supabase's session pooler on 5432). A transaction pooler
 * (Supabase 6543, PgBouncer in transaction mode) can't deliver notifications,
 * so for Supabase the session pooler on the same host is used.
 */
const listenUrl = (): string | undefined => {
  if (env.DATA_LISTEN_URL) {
    return env.DATA_LISTEN_URL === 'off' ? undefined : env.DATA_LISTEN_URL;
  }

  if (!URL.canParse(dataUrl)) return undefined;

  const url = new URL(dataUrl);

  if (url.port === '6543') {
    if (!url.hostname.endsWith('.pooler.supabase.com')) return undefined;

    url.port = '5432';
  }

  return url.toString();
};

export const config = {
  isProduction,
  port: env.PORT,
  log: {
    level: env.LOG_LEVEL ?? 'info',
    /** Readable lines (pino-pretty, a development dependency) instead of JSON lines. */
    pretty: (env.LOG_FORMAT ?? (env.NODE_ENV === 'development' ? 'pretty' : 'json')) === 'pretty',
  },
  otel: {
    /** Where traces go (OTLP over HTTP); the exporter reads the other OTEL_EXPORTER_OTLP_* settings. Unset: no spans leave the process. */
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  },
  data: {
    url: dataUrl,
    ssl: env.DATA_SSL ?? false,
    /** CA for the Postgres certificate (PEM), e.g. Supabase's root CA. */
    sslCa: env.DATA_SSL_CA,
    /** Skip certificate verification: development only (refused in production). */
    sslInsecure: env.DATA_SSL_INSECURE ?? false,
    poolMax: env.DATA_POOL_MAX,
    /**
     * The owner role for migrations (`pnpm db:migrate`): DDL rights the API's
     * runtime role (DATA_URL) must not have. Falls back to DATA_URL.
     */
    migrationUrl: env.DATA_MIGRATION_URL,
    /** The API's runtime role, granted access to core's tables after `pnpm db:migrate`. */
    runtimeRole: env.DATA_RUNTIME_ROLE,
    /** Apply migrations when the API starts: development only by default. */
    migrateOnStart: env.DATA_MIGRATE_ON_START ?? !isProduction,
    /** A role to `SET ROLE` to on each connection (session connections only). */
    role: env.DATA_ROLE,
    statementTimeoutMs: env.DATA_STATEMENT_TIMEOUT_MS,
  },
  live: {
    /** `DATA_LISTEN_URL` (or derived from DATA_URL); `off` turns live updates off. */
    listenUrl: listenUrl(),
    /** Open streams a member may have at once (browsers share one across tabs). */
    maxStreamsPerUser: env.LIVE_MAX_STREAMS_PER_USER,
  },
  setup: {
    /**
     * First-run setup (create the first organisation and owner from the UI)
     * while the database has none. Off where the SaaS side creates organisations.
     */
    enabled: env.CORE_SETUP ?? true,
  },
  auth: {
    jwtSecret: env.CORE_JWT_SECRET ?? 'erxes-core-local-development-secret',
    accessTokenTtlSeconds: env.CORE_ACCESS_TOKEN_TTL_SECONDS,
    /** Browser session (HttpOnly cookie) length. */
    sessionHours: env.CORE_SESSION_HOURS,
    /**
     * Organisation used for sign-in when neither the address nor the request
     * names one (self-hosted single organisation, local development).
     */
    defaultSubdomain: env.DEFAULT_SUBDOMAIN,
    /** Failed sign-ins to one account within 15 minutes before owners hear about it. */
    failedSignInAlert: env.FAILED_SIGN_IN_ALERT,
    /**
     * Core's signing key (EC P-256, PKCS#8 PEM): plugin tokens and audit
     * checkpoints, verified by anyone with the public keys at
     * `/core/v1/.well-known/jwks.json`. Without it, development generates one
     * and keeps it in `signingKeyFile`; production requires it.
     */
    signingKey: env.CORE_SIGNING_KEY,
    signingKeyFile: env.CORE_SIGNING_KEY_DEV_FILE ?? './data/keys/signing-key.pem',
    /** Previous keys (PEM, public or private), still published so older signatures verify. */
    retiredSigningKeys: env.CORE_SIGNING_KEYS_RETIRED,
    /** Seals secrets core reads back (webhook secrets, gateway keys); default: derived from CORE_JWT_SECRET. */
    encryptionKey: env.CORE_ENCRYPTION_KEY,
  },
  app: {
    /**
     * Where people open erxes, for links in emails. `{subdomain}` is replaced
     * by the organisation's (`https://{subdomain}.erxes.io`).
     */
    url: env.APP_URL,
  },
  email: {
    /** `smtp` (EMAIL_SMTP_URL) or `log` (development: written to the log, not sent). */
    driver: env.EMAIL_DRIVER ?? (env.EMAIL_SMTP_URL ? 'smtp' : 'log'),
    /** `smtps://user:pass@smtp.example.com:465` (SES, Mailgun, Postmark, …). */
    smtpUrl: env.EMAIL_SMTP_URL,
    from: env.EMAIL_FROM ?? 'erxes <no-reply@erxes.io>',
  },
  outbound: {
    /**
     * Webhooks and automation calls may reach http and private addresses
     * (development only: refused in production, against SSRF).
     */
    allowPrivate: env.OUTBOUND_ALLOW_PRIVATE ?? !isProduction,
  },
  /**
   * SaaS (erxes.io): core reads each organisation's plugins and tiers from
   * erxes.io's entitlement API and enforces them. Off: self-hosted, every
   * plugin at its top tier, nothing to check.
   */
  saas: {
    enabled: env.SAAS ?? false,
    /** erxes.io, whose `/api/platform/organizations/plugins?subdomain=` answers what each organisation has. */
    platformUrl: env.SAAS_PLATFORM_URL,
    /** Bearer token both ways: core → erxes.io (PLATFORM_API_TOKEN there), erxes.io → core's /saas/*. */
    platformToken: env.SAAS_PLATFORM_TOKEN,
    /** erxes.io's sign-in hand-off key (its SAAS_JWT_TOKEN_SECRET, HS256). */
    handoffSecret: env.SAAS_JWT_TOKEN_SECRET,
    /** Days a plugin that left the plan stays read-only before it is turned off. */
    graceDays: env.SAAS_GRACE_DAYS,
    /** Where owners manage the subscription; `{subdomain}` is replaced. */
    billingUrl: env.SAAS_BILLING_URL ?? 'https://erxes.io/organizations',
  },
  /** Secret → plugin name. */
  pluginKeys: env.CORE_PLUGIN_KEYS,
  plugins: {
    /**
     * Install every plugin in every organisation (new plugins once, new
     * organisations at creation). On for self-hosted and development; off
     * where the SaaS side decides what each organisation has.
     */
    autoInstall: env.PLUGINS_AUTO_INSTALL ?? env.CORE_SETUP !== false,
  },
  files: {
    /** `local` (a folder on this server) or `s3` (AWS S3, Cloudflare R2, MinIO, …). */
    driver: env.FILES_STORAGE ?? 'local',
    localDir: env.FILES_LOCAL_DIR ?? './data/files',
    s3: {
      bucket: env.S3_BUCKET ?? '',
      region: env.S3_REGION ?? 'auto',
      /** R2 / MinIO address; empty for AWS. */
      endpoint: env.S3_ENDPOINT,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      forcePathStyle: env.S3_FORCE_PATH_STYLE ?? false,
    },
    /** The deployment's limit; organisations can only lower it. */
    maxSizeMb: env.FILES_MAX_SIZE_MB,
    /** How long upload and download links work. */
    linkTtlSeconds: env.FILES_LINK_TTL_SECONDS,
    /** Uploads granted but never finished are removed after this long. */
    pendingTtlHours: env.FILES_PENDING_TTL_HOURS,
  },
  retention: {
    /** Audit log entries older than this are deleted. */
    auditDays: env.AUDIT_RETENTION_DAYS,
    /** Read notifications older than this are deleted. */
    readNotificationDays: env.NOTIFICATIONS_RETENTION_DAYS,
    /** Events are kept this long once every consumer has handled them. */
    eventDays: env.EVENTS_RETENTION_DAYS,
    /** Finished automation runs keep their step log and context this long; the run row stays. */
    runDetailDays: env.AUTOMATION_RUN_DETAILS_RETENTION_DAYS,
  },
  massDelete: {
    /** Deletions by one member or plugin in 10 minutes before owners are told … */
    alertAt: env.MASS_DELETE_ALERT,
    /** … and before they are stopped: members refused, plugins suspended. Owners aren't limited. */
    stopAt: env.MASS_DELETE_LIMIT,
  },
};
