import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { register } from 'import-in-the-middle/register-hooks.mjs';
import { config } from '#/config.ts';

// Loaded before the app with `node --import ./src/telemetry.ts`. Off unless an
// OTLP endpoint is set.
if (config.tracing) {
  // ESM modules are patched through this in-thread loader hook (module.registerHooks).
  register();

  const sdk = new NodeSDK({
    serviceName: '__id__-api',
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PgInstrumentation(),
      new PinoInstrumentation(),
    ],
  });

  sdk.start();
  process.once('SIGTERM', () => void sdk.shutdown());
}
