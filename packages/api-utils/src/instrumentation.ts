import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';

const { OTEL_EXPORTER_OTLP_ENDPOINT } = process.env;

if(OTEL_EXPORTER_OTLP_ENDPOINT){

  
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: OTEL_EXPORTER_OTLP_ENDPOINT // OTLP HTTP endpoint
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });
  
  sdk.start();
  
 
}
