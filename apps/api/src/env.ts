import { EMAIL_DRIVERS, FILE_STORAGES, LOG_FORMATS, LOG_LEVELS } from '@erxes/core-db/enums';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { baseUrl, flag, list, optional, overrideUrl, positive, text } from './envFields';

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
  'CORE_ENCRYPTION_KEYS_RETIRED',
  'CORE_PLUGIN_KEYS',
  'EMAIL_SMTP_URL',
  'SAAS_PLATFORM_TOKEN',
  'SAAS_JWT_TOKEN_SECRET',
  'SAAS_STRIPE_SECRET_KEY',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'CLOUDFLARE_ACCESS_KEY_ID',
  'CLOUDFLARE_SECRET_ACCESS_KEY',
  'CLOUDFLARE_API_TOKEN',
  'QUICK_QR_PASSWORD',
  'INTEGRATION_OAUTH_APPS',
  'META_APP_SECRET',
  'META_RELAY_KEY',
  'GITHUB_APP_PRIVATE_KEY',
  'ERXES_LICENSE',
  'ERXES_ACTIVATION_KEY',
  'GITHUB_APP_CLIENT_SECRET',
] as const;

const readSecret = (name: string) => {
  const file = process.env[`${name}_FILE`];

  return file ? readFileSync(file, 'utf8') : process.env[name];
};

const PLUGIN_NAME = /^[a-z][a-z0-9_]{0,39}$/;

/**
 * Plugin client secrets, `hr:<secret>,ecom:<secret>`, as secret → plugin name.
 * They are registered (hashed) in `core_plugins` at startup; a plugin trades
 * its secret for short-lived tokens (`POST /core/v1/plugins/token`) and never
 * sends it on API calls. `pnpm plugin:secret <name>` rotates one.
 */
const OAuthApp = z.object({ clientId: z.string().min(1), clientSecret: z.string().min(1) });

const oauthApps = optional(z.string())
  .transform((value, ctx) => {
    if (!value) return {};

    try {
      return z.record(z.string(), OAuthApp).parse(JSON.parse(value));
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'INTEGRATION_OAUTH_APPS is JSON: {"google":{"clientId":"…","clientSecret":"…"}}',
      });

      return z.NEVER;
    }
  })
  .pipe(z.record(z.string(), OAuthApp));

/** A P-256 public key erxes.io signs "Open as support" links with; only the public part is kept. */
const SupportKey = z.object({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  kid: z.string().min(1),
  x: z.string().min(1),
  y: z.string().min(1),
});

const supportJwks = optional(z.string()).transform((value, ctx) => {
  if (!value) return [];

  try {
    return z.array(SupportKey).parse(JSON.parse(value));
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'SUPPORT_LOGIN_JWKS is JSON: [{"kty":"EC","crv":"P-256","kid":"…","x":"…","y":"…"}]',
    });

    return z.NEVER;
  }
});

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

    LOG_LEVEL: optional(z.enum(LOG_LEVELS)),
    LOG_FORMAT: optional(z.enum(LOG_FORMATS)),
    OTEL_EXPORTER_OTLP_ENDPOINT: optional(z.url()),

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
    CORE_ENCRYPTION_KEYS_RETIRED: text,
    CORE_PLUGIN_KEYS: pluginKeys,
    PLUGINS_AUTO_INSTALL: flag,

    APP_URL: baseUrl('http://localhost:3500'),

    EMAIL_DRIVER: optional(z.enum(EMAIL_DRIVERS)),
    EMAIL_SMTP_URL: text,
    EMAIL_FROM: text,
    SENDGRID_WEBHOOK_PUBLIC_KEY: text,
    SES_CONFIGURATION_SET: text,
    SES_EVENTS_TOPIC_ARNS: list,
    EMAIL_AUTH_HOURLY_CAP: positive(300),

    BROADCAST_PER_MINUTE: positive(600),

    OUTBOUND_ALLOW_PRIVATE: flag,

    ASSISTANT_OPENAI_URL: overrideUrl,
    ASSISTANT_ANTHROPIC_URL: overrideUrl,
    ASSISTANT_OPENROUTER_URL: overrideUrl,
    ASSISTANT_KIMI_URL: overrideUrl,
    ASSISTANT_KIMI_CODE_URL: overrideUrl,
    ASSISTANT_GROK_URL: overrideUrl,
    ASSISTANT_TYPESAFE_URL: overrideUrl,
    EBARIMT_TAXPAYER_URL: baseUrl('https://api.ebarimt.mn/api/info/check'),
    // QPay QuickQR's vendor account: the names erxes 3.x used, so its settings carry over.
    QUICK_QR_URL: baseUrl('https://quickqr.qpay.mn'),
    QUICK_QR_USERNAME: text,
    QUICK_QR_PASSWORD: text,

    INTEGRATION_OAUTH_APPS: oauthApps,
    INTEGRATION_OAUTH_CALLBACK_URL: optional(z.url()),
    META_APP_ID: optional(z.string().regex(/^\d+$/, 'META_APP_ID is the Meta app id, digits only')),
    META_APP_SECRET: text,
    GITHUB_APP_ID: optional(z.string().regex(/^\d+$/, 'GITHUB_APP_ID is the App id, digits only')),
    GITHUB_APP_SLUG: text,
    GITHUB_APP_PRIVATE_KEY: optional(z.string().transform((value) => value.replace(/\\n/g, '\n'))),
    GITHUB_APP_CLIENT_ID: text,
    GITHUB_APP_CLIENT_SECRET: text,
    META_RELAY_URL: overrideUrl,
    META_RELAY_KEY: optional(z.string().min(16)),

    SAAS: flag,
    SAAS_PLATFORM_URL: baseUrl('https://erxes.io'),
    SAAS_PLATFORM_TOKEN: text,
    SAAS_JWT_TOKEN_SECRET: text,
    SAAS_GRACE_DAYS: positive(7),
    SAAS_BILLING_URL: text,
    SAAS_STRIPE_SECRET_KEY: text,
    // erxes.io's public keys for "Open as support" links: a JSON array of P-256 JWKs with `kid`.
    SUPPORT_LOGIN_JWKS: supportJwks,
    // Self-hosted: the erxes license (a JWT) given by hand, or the server's activation key, with
    // which core fetches it from erxes.io every day. Core verifies it with keys built into it.
    ERXES_LICENSE: text,
    ERXES_ACTIVATION_KEY: text,
    // The build this is (the image's commit), as a self-hosted server reports it to erxes.io.
    VERSION: text,

    FILES_STORAGE: optional(z.string().toLowerCase().pipe(z.enum(FILE_STORAGES))),
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
    // Cloudflare (FILES_STORAGE=cloudflare): the names erxes 3.x used, so its settings carry over.
    CLOUDFLARE_ACCOUNT_ID: text,
    CLOUDFLARE_BUCKET_NAME: text,
    CLOUDFLARE_ACCESS_KEY_ID: text,
    CLOUDFLARE_SECRET_ACCESS_KEY: text,
    CLOUDFLARE_USE_CDN: flag,
    CLOUDFLARE_API_TOKEN: text,
    CLOUDFLARE_ACCOUNT_HASH: text,

    AUDIT_RETENTION_DAYS: positive(365),
    NOTIFICATIONS_RETENTION_DAYS: positive(90),
    EVENTS_RETENTION_DAYS: positive(30),
    AUTOMATION_RUN_DETAILS_RETENTION_DAYS: positive(90),

    MASS_DELETE_ALERT: positive(100),
    MASS_DELETE_LIMIT: positive(500),

    AGENT_MAX_TURNS: optional(z.coerce.number().int().positive()).transform((value) => value ?? 30),
    AGENT_RUNS_PER_MINUTE: positive(60),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;

    const problem = (message: string) => ctx.addIssue({ code: 'custom', message });

    if (!env.DATA_URL) problem('DATA_URL (or DATA_URL_FILE) must be set in production');

    if (!env.CORE_JWT_SECRET) {
      problem('CORE_JWT_SECRET (or CORE_JWT_SECRET_FILE) must be set in production');
    }

    if (!env.CORE_ENCRYPTION_KEY) {
      problem(
        'CORE_ENCRYPTION_KEY (or CORE_ENCRYPTION_KEY_FILE) must be set in production: openssl rand -base64 48',
      );
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
    if (env.SAAS && ((env.SAAS_PLATFORM_TOKEN?.length ?? 0) < 32 || !env.SAAS_STRIPE_SECRET_KEY)) {
      ctx.addIssue({
        code: 'custom',
        message: 'SAAS=true needs SAAS_PLATFORM_TOKEN (≥ 32 characters) and SAAS_STRIPE_SECRET_KEY',
      });
    }

    if (!env.META_APP_ID !== !env.META_APP_SECRET) {
      ctx.addIssue({ code: 'custom', message: 'Set META_APP_ID and META_APP_SECRET together' });
    }

    if (!env.META_RELAY_URL !== !env.META_RELAY_KEY) {
      ctx.addIssue({ code: 'custom', message: 'Set META_RELAY_URL and META_RELAY_KEY together' });
    }

    if (env.META_RELAY_URL && !env.META_APP_ID) {
      ctx.addIssue({
        code: 'custom',
        message: "META_RELAY_URL needs META_APP_ID and META_APP_SECRET: the relay's Meta app",
      });
    }

    if (env.META_APP_ID && env.INTEGRATION_OAUTH_APPS.facebook) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Set the Facebook app once: META_APP_ID and META_APP_SECRET, not INTEGRATION_OAUTH_APPS.facebook',
      });
    }

    if (env.FILES_STORAGE === 's3' && !env.S3_BUCKET) {
      ctx.addIssue({ code: 'custom', message: 'FILES_STORAGE=s3 needs S3_BUCKET' });
    }

    if (
      env.FILES_STORAGE === 'cloudflare' &&
      !(
        env.CLOUDFLARE_ACCOUNT_ID &&
        env.CLOUDFLARE_BUCKET_NAME &&
        env.CLOUDFLARE_ACCESS_KEY_ID &&
        env.CLOUDFLARE_SECRET_ACCESS_KEY
      )
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'FILES_STORAGE=cloudflare needs CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_ACCESS_KEY_ID and CLOUDFLARE_SECRET_ACCESS_KEY',
      });
    }

    if (
      env.CLOUDFLARE_USE_CDN &&
      !(
        env.FILES_STORAGE === 'cloudflare' &&
        env.CLOUDFLARE_API_TOKEN &&
        env.CLOUDFLARE_ACCOUNT_HASH
      )
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'CLOUDFLARE_USE_CDN=true needs FILES_STORAGE=cloudflare, CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_HASH',
      });
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

/** The environment, checked. `config.ts` shapes it into the settings the code reads. */
export const env = parsed.data;
