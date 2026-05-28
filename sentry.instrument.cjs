const Sentry = require('@sentry/node');

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE || process.env.RELEASE,
    serverName: process.env.SENTRY_SERVER_NAME,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
  });

  console.info(
    `[sentry] initialized: ${process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'unknown'}`,
  );
}
