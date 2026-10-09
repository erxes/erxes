// Apollo Router tracing, configured from the standard OpenTelemetry env vars.
// Nothing is added to the router config unless OTEL_EXPORTER_OTLP_ENDPOINT is set.
//
//   OTEL_EXPORTER_OTLP_ENDPOINT  e.g. http://alloy:4317 (grpc) or http://alloy:4318 (http)
//   OTEL_EXPORTER_OTLP_PROTOCOL  grpc (default) | http/protobuf
//   OTEL_EXPORTER_OTLP_HEADERS   key1=value1,key2=value2
//   OTEL_SERVICE_NAME            default: gateway
//   OTEL_TRACES_SAMPLER_ARG      ratio 0..1, default: 0.1

const DEFAULT_SERVICE_NAME = 'gateway';
const DEFAULT_SAMPLE_RATIO = 0.1;

const parseHeaders = (value?: string) => {
  const headers: Record<string, string> = {};

  for (const pair of (value || '').split(',')) {
    const index = pair.indexOf('=');

    if (index <= 0) {
      continue;
    }

    const key = pair.slice(0, index).trim();
    const raw = pair.slice(index + 1).trim();

    try {
      headers[key] = decodeURIComponent(raw);
    } catch {
      headers[key] = raw;
    }
  }

  return Object.keys(headers).length ? headers : undefined;
};

const parseSampleRatio = (value?: string) => {
  if (!value?.trim()) {
    return DEFAULT_SAMPLE_RATIO;
  }

  const ratio = Number(value);

  return Number.isFinite(ratio) && ratio >= 0 && ratio <= 1
    ? ratio
    : DEFAULT_SAMPLE_RATIO;
};

const getEndpoint = (env: NodeJS.ProcessEnv) =>
  (env.OTEL_EXPORTER_OTLP_ENDPOINT || '').trim();

export const isTracingEnabled = (env: NodeJS.ProcessEnv = process.env) =>
  Boolean(getEndpoint(env));

export const createTelemetryConfig = (env: NodeJS.ProcessEnv = process.env) => {
  const endpoint = getEndpoint(env);

  if (!endpoint) {
    return undefined;
  }

  const protocol = (env.OTEL_EXPORTER_OTLP_PROTOCOL || '')
    .trim()
    .toLowerCase()
    .startsWith('http')
    ? 'http'
    : 'grpc';
  const headers = parseHeaders(env.OTEL_EXPORTER_OTLP_HEADERS);

  return {
    instrumentation: {
      spans: {
        // The default (deprecated) mode exports graphql.document, which carries
        // inline literals such as passwords. Per-span attribute config needs a
        // GraphOS license; without one the router refuses to start.
        mode: 'spec_compliant',
      },
    },
    exporters: {
      tracing: {
        common: {
          service_name:
            (env.OTEL_SERVICE_NAME || '').trim() || DEFAULT_SERVICE_NAME,
          sampler: parseSampleRatio(env.OTEL_TRACES_SAMPLER_ARG),
          // The gateway is the edge: clients must not force sampling.
          parent_based_sampler: false,
        },
        propagation: {
          trace_context: true,
        },
        otlp: {
          enabled: true,
          endpoint,
          protocol,
          ...(headers &&
            (protocol === 'http'
              ? { http: { headers } }
              : { grpc: { metadata: headers } })),
        },
      },
    },
  };
};
