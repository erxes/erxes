import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, NoopSpanProcessor } from '@opentelemetry/sdk-trace';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ORPCInstrumentation } from '@orpc/otel';
import { version } from '../package.json';
import { config } from '~/config';

/**
 * Tracing. main.ts imports this before anything else, so the instrumentations
 * patch http, express and pg before they load. Spans always get ids, so log
 * lines carry `trace_id` and `span_id` (the mixin in src/logger.ts); spans
 * leave the process only when OTEL_EXPORTER_OTLP_ENDPOINT is set (the exporter
 * reads the OTEL_EXPORTER_OTLP_* variables). Logs and metrics stay out of
 * OTLP: logs go to stdout.
 */
const sdk = new NodeSDK({
  resource: defaultResource().merge(
    resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'erxes-core', [ATTR_SERVICE_VERSION]: version }),
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
  ],
});

sdk.start();

// After start: @orpc/otel is ESM-only and takes its tracer from the ESM build
// of @opentelemetry/api, which sees only a tracer provider registered before
// that (this CommonJS bundle registers it through the CommonJS build).
registerInstrumentations({ instrumentations: [new ORPCInstrumentation()] });

/** Sends the spans still buffered (at shutdown). */
export const stopTracing = () => sdk.shutdown();
