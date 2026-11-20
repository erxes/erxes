import { env } from './env';

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
  broadcast: {
    /** Copies one broadcast sends a minute, within what the mail or SMS provider allows. */
    perMinute: env.BROADCAST_PER_MINUTE,
  },
  sms: {
    /**
     * How customer sign-in codes reach phones. `log` (development: written to
     * the log, not sent); country providers are drivers in `modules/sms`.
     */
    driver: env.SMS_DRIVER ?? 'log',
  },
  outbound: {
    /**
     * Webhooks and automation calls may reach http and private addresses
     * (development only: refused in production, against SSRF).
     */
    allowPrivate: env.OUTBOUND_ALLOW_PRIVATE ?? !isProduction,
  },
  ebarimt: {
    /** The tax office's taxpayer lookup (`getTinInfo`, `getInfo`): company receipts check the number there. */
    taxpayerUrl: env.EBARIMT_TAXPAYER_URL,
  },
  meta: {
    app:
      env.META_APP_ID && env.META_APP_SECRET
        ? { appId: env.META_APP_ID, appSecret: env.META_APP_SECRET }
        : null,
    verifyToken: env.META_VERIFY_TOKEN,
    publicUrl: env.META_PUBLIC_URL?.replace(/\/+$/, ''),
    relay:
      env.META_RELAY_URL && env.META_RELAY_KEY && env.META_PUBLIC_URL
        ? {
            url: env.META_RELAY_URL.replace(/\/+$/, ''),
            key: env.META_RELAY_KEY,
            webhookUrl: `${env.META_PUBLIC_URL.replace(/\/+$/, '')}/core/v1/meta/webhook`,
          }
        : null,
    graphUrl: 'https://graph.facebook.com/v23.0',
    dialogUrl: 'https://www.facebook.com/v23.0/dialog/oauth',
  },
  /**
   * SaaS (erxes.io): core reads each organisation's plugins, tiers and
   * bundles from its Stripe customer and enforces them. Off: self-hosted,
   * every plugin at its top tier, nothing to check.
   */
  saas: {
    enabled: env.SAAS ?? false,
    /** erxes.io, where a refused sign-in link goes back to. */
    platformUrl: env.SAAS_PLATFORM_URL,
    /** erxes.io → core's /saas/* (PLATFORM_API_TOKEN there). */
    platformToken: env.SAAS_PLATFORM_TOKEN,
    /** Reads erxes.io's Stripe account: customers, subscriptions, products. */
    stripe: { key: env.SAAS_STRIPE_SECRET_KEY, url: 'https://api.stripe.com/v1' },
    /** erxes.io's sign-in hand-off key (its SAAS_JWT_TOKEN_SECRET, HS256). */
    handoffSecret: env.SAAS_JWT_TOKEN_SECRET,
    /** Days a plugin that left the plan stays read-only before it is turned off. */
    graceDays: env.SAAS_GRACE_DAYS,
    /** Where owners manage the subscription; `{subdomain}` is replaced. */
    billingUrl: env.SAAS_BILLING_URL ?? 'https://erxes.io/organizations',
  },
  assistant: {
    endpoints: {
      openai: env.ASSISTANT_OPENAI_URL,
      grok: env.ASSISTANT_GROK_URL,
      kimi: env.ASSISTANT_KIMI_URL,
      'kimi-code': env.ASSISTANT_KIMI_CODE_URL,
    },
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
    /**
     * `local` (a folder on this server), `s3` (AWS S3, R2, MinIO, …) or
     * `cloudflare` (an R2 bucket, plus Images and Stream with `cloudflare.useCdn`).
     */
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
    cloudflare: {
      /** The R2 bucket, through its S3 API. */
      r2: {
        bucket: env.CLOUDFLARE_BUCKET_NAME ?? '',
        region: 'auto',
        endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID ?? 'account'}.r2.cloudflarestorage.com`,
        accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
        forcePathStyle: false,
      },
      /** Images go to Cloudflare Images and videos to Stream after they reach R2. */
      useCdn: env.CLOUDFLARE_USE_CDN ?? false,
      accountId: env.CLOUDFLARE_ACCOUNT_ID ?? '',
      apiToken: env.CLOUDFLARE_API_TOKEN,
      /** Images' delivery address: `<imagesUrl>/<accountHash>/<image id>/<variant>`. */
      accountHash: env.CLOUDFLARE_ACCOUNT_HASH ?? '',
      apiUrl: 'https://api.cloudflare.com/client/v4',
      imagesUrl: 'https://imagedelivery.net',
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
  agents: {
    /** Tool rounds one run may take; the round that reaches it ends the run with `turn_limit`. */
    maxTurns: env.AGENT_MAX_TURNS,
    /** Runs one organisation may start a minute, counted across every server. */
    runsPerMinute: env.AGENT_RUNS_PER_MINUTE,
  },
};
