/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

const { OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_DEBUG_LEVEL } = process.env;

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
// if (OTEL_DEBUG_LEVEL) {
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[OTEL_DEBUG_LEVEL || ''] || DiagLogLevel);
// }

// if (OTEL_EXPORTER_OTLP_ENDPOINT) {
const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
  }),

  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
// }
