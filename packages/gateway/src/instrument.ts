import * as dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const { SENTRY_URL, SENTRY_PROJECT_NAME, VERSION } = process.env;

// Ensure to call this before requiring any other modules!
if (SENTRY_URL) {
  Sentry.init({
    dsn: SENTRY_URL,
    release: `${SENTRY_PROJECT_NAME}@${VERSION}`,
    integrations: [
      // Add our Profiling integration
      nodeProfilingIntegration()
    ],

    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0
  });
}
