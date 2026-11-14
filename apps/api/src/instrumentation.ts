import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, NoopSpanProcessor } from '@opentelemetry/sdk-trace';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ORPCInstrumentation } from '@orpc/otel';
import { register } from 'import-in-the-middle/register-hooks.mjs';
import packageJson from '../package.json' with { type: 'json' };
import { config } from '~/config';

/**
 * Tracing, preloaded before the app: `node --import ./dist/instrumentation.js
 * dist/main.js` (`tsx --import ./src/instrumentation.ts` in development).
 * ESM imports reach the instrumentations only through a loader hook, and the
 * hook sees only modules loaded after it is registered, so http, express and
 * pg must not load before this file has run. Spans always get ids, so log
 * lines carry `trace_id` and `span_id` (the mixin in src/logger.ts); spans
 * leave the process only when OTEL_EXPORTER_OTLP_ENDPOINT is set (the exporter
 * reads the OTEL_EXPORTER_OTLP_* variables). Logs and metrics stay out of
 * OTLP: logs go to stdout.
 */
// The loader hook @opentelemetry/instrumentation documents (hook.mjs), run in-thread through
// module.registerHooks: module.register is deprecated. Only the modules the instrumentations
// below patch go through it. import-in-the-middle must resolve to the copy
// @opentelemetry/instrumentation uses (one version in pnpm-lock.yaml), or the hooks never fire.
register({ include: ['http', 'https', 'express', 'pg'] });

const sdk = new NodeSDK({
  resource: defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'erxes-core',
      [ATTR_SERVICE_VERSION]: packageJson.version,
    }),
  ),
  spanProcessors: [
    config.otel.endpoint
      ? new BatchSpanProcessor({ exporter: new OTLPTraceExporter() })
      : new NoopSpanProcessor(),
  ],
  logRecordProcessors: [],
  metricReaders: [],
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    // Queries outside a request or a `traced()` job (the LISTEN connection) make no spans.
    new PgInstrumentation({ requireParentSpan: true }),
    new ORPCInstrumentation(),
  ],
});

sdk.start();

/** Sends the spans still buffered (at shutdown). */
export const stopTracing = () => sdk.shutdown();
