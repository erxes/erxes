import { createTelemetryConfig } from './telemetry';

const otlpOf = (env: NodeJS.ProcessEnv) =>
  createTelemetryConfig(env)?.exporters.tracing.otlp;

describe('Apollo Router telemetry config', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('adds nothing when OTEL_EXPORTER_OTLP_ENDPOINT is unset', () => {
    expect(createTelemetryConfig({})).toBeUndefined();
  });

  it('defaults to OTLP/HTTP, like the gateway Node spans on the same endpoint', () => {
    expect(
      otlpOf({ OTEL_EXPORTER_OTLP_ENDPOINT: 'http://alloy:4318' }),
    ).toMatchObject({ endpoint: 'http://alloy:4318', protocol: 'http' });
  });

  it.each([
    ['grpc', 'grpc'],
    ['http/protobuf', 'http'],
    ['http/json', 'http'],
    ['unknown', 'http'],
  ])('OTEL_EXPORTER_OTLP_PROTOCOL=%s exports over %s', (value, protocol) => {
    expect(
      otlpOf({
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://alloy:4318',
        OTEL_EXPORTER_OTLP_PROTOCOL: value,
      })?.protocol,
    ).toBe(protocol);
  });

  it('sends headers as HTTP headers over http and as metadata over grpc', () => {
    const env = {
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://alloy:4318',
      OTEL_EXPORTER_OTLP_HEADERS: 'cf-access-client-id=a,x-scope=b%3Dc',
    };

    expect(otlpOf(env)).toMatchObject({
      http: { headers: { 'cf-access-client-id': 'a', 'x-scope': 'b=c' } },
    });
    expect(
      otlpOf({ ...env, OTEL_EXPORTER_OTLP_PROTOCOL: 'grpc' }),
    ).toMatchObject({
      grpc: { metadata: { 'cf-access-client-id': 'a', 'x-scope': 'b=c' } },
    });
  });

  it('keeps spans spec-compliant, sampled at the edge, named gateway by default', () => {
    const tracing = createTelemetryConfig({
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://alloy:4318',
    });

    expect(tracing?.instrumentation.spans.mode).toBe('spec_compliant');
    expect(tracing?.exporters.tracing.common).toEqual({
      service_name: 'gateway',
      sampler: 0.1,
      parent_based_sampler: false,
    });
  });
});
