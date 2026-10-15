/**
 * OpenTelemetry tracing for erxes services. Off unless OTEL_EXPORTER_OTLP_ENDPOINT is set.
 *
 * Sentry's instrumentations (http, express, graphql, mongodb, mongoose, ioredis) create the
 * spans. Sentry's own OpenTelemetry setup is skipped: the provider below samples them, joins
 * the caller's W3C `traceparent` and exports them over OTLP/HTTP, so Sentry stays an error
 * reporter and sends no transactions for this.
 *
 * Env:
 *   OTEL_EXPORTER_OTLP_ENDPOINT  OTLP/HTTP collector base URL, e.g. http://alloy:4318 (turns
 *                                tracing on; the gRPC port 4317 will not work)
 *   OTEL_SERVICE_NAME            service name on the spans (default 'erxes-plugin')
 *   OTEL_TRACES_SAMPLER_ARG      share of new traces to keep, 0..1 (default 0.1); requests
 *                                that arrive with a traceparent follow the caller's decision
 *   SENTRY_DSN                   required: without it Sentry loads no instrumentation
 */
import { context, propagation, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ParentBasedSampler,
  SpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import * as Sentry from '@sentry/node';

const DEFAULT_SAMPLE_RATIO = 0.1;
const DEFAULT_SERVICE_NAME = 'erxes-plugin';

const REQUEST_HEADER_PREFIX = 'http.request.header.';

let started = false;
let warnedNoDsn = false;

export const isTracingRequested = (): boolean =>
  Boolean((process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '').trim());

/** Root sample ratio from OTEL_TRACES_SAMPLER_ARG; empty or invalid values fall back to 0.1. */
export const parseSampleRatio = (value: string | undefined): number => {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_SAMPLE_RATIO;
  }

  const ratio = Number(value);

  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
    console.warn(
      `[tracing] OTEL_TRACES_SAMPLER_ARG=${JSON.stringify(
        value,
      )} is not a number between 0 and 1; using ${DEFAULT_SAMPLE_RATIO}`,
    );

    return DEFAULT_SAMPLE_RATIO;
  }

  return ratio;
};

/** Options merged into Sentry.init; empty when tracing is off. */
export const sentryTracingOptions = (): {
  skipOpenTelemetrySetup?: boolean;
  propagateTraceparent?: boolean;
} => {
  if (!isTracingRequested()) {
    return {};
  }

  // Sentry's propagator reads only sentry-trace/baggage; the provider below owns propagation.
  return { skipOpenTelemetrySetup: true, propagateTraceparent: true };
};

/** Tracing needs Sentry's instrumentations, which load only when Sentry has a DSN. */
export const warnTracingWithoutDsn = (): void => {
  if (warnedNoDsn || !isTracingRequested()) {
    return;
  }

  warnedNoDsn = true;

  console.warn(
    '[tracing] OTEL_EXPORTER_OTLP_ENDPOINT is set but SENTRY_DSN is not; tracing is off',
  );
};

/**
 * Sentry records incoming request headers on server spans. It filters auth headers but not
 * the gateway's `user` header (base64 user JSON); traces need none of them.
 */
export const dropRequestHeadersProcessor: SpanProcessor = {
  onStart: () => undefined,
  onEnd: (span) => {
    for (const key of Object.keys(span.attributes)) {
      if (key.startsWith(REQUEST_HEADER_PREFIX)) {
        delete span.attributes[key];
      }
    }
  },
  forceFlush: async () => undefined,
  shutdown: async () => undefined,
};

const serviceName = (): string => {
  const name = (process.env.OTEL_SERVICE_NAME || '').trim();

  if (name) {
    return name;
  }

  console.warn(
    `[tracing] OTEL_SERVICE_NAME is not set; spans are reported as "${DEFAULT_SERVICE_NAME}"`,
  );

  return DEFAULT_SERVICE_NAME;
};

/** Registers the tracer provider. Call right after Sentry.init; a no-op when tracing is off. */
export const startTracing = (): void => {
  if (started || !isTracingRequested()) {
    return;
  }

  started = true;

  const name = serviceName();
  const ratio = parseSampleRatio(process.env.OTEL_TRACES_SAMPLER_ARG);

  const provider = new BasicTracerProvider({
    resource: resourceFromAttributes({ 'service.name': name }),
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(ratio),
    }),
    spanProcessors: [
      dropRequestHeadersProcessor,
      // Reads the OTEL_EXPORTER_OTLP_* env vars itself (endpoint + /v1/traces, headers).
      new BatchSpanProcessor(new OTLPTraceExporter()),
    ],
  });

  trace.setGlobalTracerProvider(provider);
  propagation.setGlobalPropagator(new W3CTraceContextPropagator());
  context.setGlobalContextManager(new Sentry.SentryContextManager());

  console.log(
    `[tracing] exporting spans as "${name}" over OTLP, new-trace sample ratio ${ratio}`,
  );
};
