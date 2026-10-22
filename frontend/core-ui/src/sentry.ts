/**
 * Frontend Sentry initialization (browser).
 *
 * The host (core-ui) is the single Module Federation container that loads every
 * plugin remote into the same window, so initializing Sentry here installs the
 * global error/unhandledrejection handlers for the whole app — host AND remotes.
 *
 * Errors are separated from the backend by environment tag:
 *   - production-ui        (deployed UI)
 *   - amaraa-test-local-ui (local dev)
 * while the API services report under production-api / amaraa-test-local.
 *
 * Mirrors the backend `beforeSend` noise filter
 * (backend/erxes-api-shared/src/utils/errorClassifier.ts) so expected business
 * conditions surfaced client-side don't become Sentry noise.
 *
 * NOTE: local-dev errors only appear in Sentry if the project's "localhost"
 * inbound filter is OFF (Project Settings → Inbound Filters). With it ON, Sentry
 * accepts the POST (HTTP 200) but silently discards events whose stack frames
 * are localhost — which looks exactly like the SDK "not sending".
 */
import * as Sentry from '@sentry/react';
import {
  NODE_ENV,
  REACT_APP_SENTRY_DSN,
  REACT_APP_SENTRY_ENVIRONMENT,
} from 'erxes-ui';

// Browser/runtime noise + expected business errors that must never reach Sentry.
const NOISE_PATTERNS: RegExp[] = [
  /ResizeObserver loop/i,
  /Non-Error promise rejection captured/i,
  /Network request failed/i,
  /Load failed/i,
  // expected business/auth conditions (kept in sync with the backend classifier)
  /login required/i,
  /permission required/i,
  /scope required/i,
  /portal (user )?required/i,
  /not authenticated/i,
  /unauthorized/i,
  /forbidden/i,
];

let initialized = false;

export function initSentry() {
  if (initialized) return;

  const dsn = REACT_APP_SENTRY_DSN;
  if (!dsn) return; // no-op when unconfigured (e.g. contributors without a DSN)

  Sentry.init({
    dsn,
    environment: REACT_APP_SENTRY_ENVIRONMENT || NODE_ENV,
    integrations: [Sentry.browserTracingIntegration()],
    // Full traces locally, light sampling in prod.
    tracesSampleRate: NODE_ENV === 'development' ? 1.0 : 0.1,
    beforeSend(event) {
      const message =
        event.exception?.values?.[0]?.value || event.message || '';
      if (NOISE_PATTERNS.some((pattern) => pattern.test(message))) {
        return null;
      }
      return event;
    },
  });

  initialized = true;
}
