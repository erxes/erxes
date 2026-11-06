// Import this as the FIRST line of a service's main.ts:
//
//   import 'erxes-api-shared/instrument';
//
// It starts Sentry (and OpenTelemetry tracing when OTEL_EXPORTER_OTLP_ENDPOINT is set) before
// express, graphql, mongoose or ioredis are loaded; modules loaded earlier are not instrumented.
// Keep this entrypoint free of heavy imports for the same reason.
import '../utils/sentry-instrument';
