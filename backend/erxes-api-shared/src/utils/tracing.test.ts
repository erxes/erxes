import {
  context,
  propagation,
  ProxyTracerProvider,
  trace,
} from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

type Tracing = typeof import('./tracing');

const ENV_KEYS = [
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_SERVICE_NAME',
  'OTEL_TRACES_SAMPLER_ARG',
] as const;

// Fresh module state (started / warned flags) per test.
const loadTracing = (): Tracing => {
  let tracing: Tracing | undefined;
  jest.isolateModules(() => {
    tracing = require('./tracing');
  });
  return tracing as Tracing;
};

const registeredProvider = () =>
  (trace.getTracerProvider() as ProxyTracerProvider).getDelegate().constructor
    .name;

describe('tracing', () => {
  const savedEnv: Record<string, string | undefined> = {};
  let warn: jest.SpyInstance;
  let log: jest.SpyInstance;

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    trace.disable();
    propagation.disable();
    context.disable();
    jest.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  describe('env gating', () => {
    test.each([[undefined], [''], ['   ']])(
      'is off when OTEL_EXPORTER_OTLP_ENDPOINT is %p',
      (endpoint) => {
        if (endpoint !== undefined) {
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT = endpoint;
        }
        const tracing = loadTracing();

        expect(tracing.isTracingRequested()).toBe(false);
        expect(tracing.sentryTracingOptions()).toEqual({});

        tracing.startTracing();
        tracing.warnTracingWithoutDsn();

        expect(registeredProvider()).toBe('NoopTracerProvider');
        expect(propagation.fields()).toEqual([]);
        expect(warn).not.toHaveBeenCalled();
        expect(log).not.toHaveBeenCalled();
      },
    );

    test('registers one provider with W3C propagation when the endpoint is set', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
      process.env.OTEL_SERVICE_NAME = 'sales';
      const tracing = loadTracing();

      expect(tracing.sentryTracingOptions()).toEqual({
        skipOpenTelemetrySetup: true,
        propagateTraceparent: true,
      });

      tracing.startTracing();
      tracing.startTracing();

      expect(registeredProvider()).toBe('BasicTracerProvider');
      expect(propagation.fields()).toEqual(['traceparent', 'tracestate']);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toContain('"sales"');
      expect(warn).not.toHaveBeenCalled();
    });

    test('names spans after OTEL_SERVICE_NAME', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
      process.env.OTEL_SERVICE_NAME = 'frontline';
      process.env.OTEL_TRACES_SAMPLER_ARG = '1';
      loadTracing().startTracing();

      const span = trace
        .getTracer('test')
        .startSpan('op') as unknown as ReadableSpan;

      expect(span.resource.attributes['service.name']).toBe('frontline');
    });

    test('falls back to erxes-plugin with one warning when OTEL_SERVICE_NAME is unset', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
      process.env.OTEL_TRACES_SAMPLER_ARG = '1';
      const tracing = loadTracing();

      tracing.startTracing();
      tracing.startTracing();

      const span = trace
        .getTracer('test')
        .startSpan('op') as unknown as ReadableSpan;

      expect(span.resource.attributes['service.name']).toBe('erxes-plugin');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('OTEL_SERVICE_NAME');
    });

    test('warns once that tracing needs SENTRY_DSN', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
      const tracing = loadTracing();

      tracing.warnTracingWithoutDsn();
      tracing.warnTracingWithoutDsn();

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('SENTRY_DSN');
      expect(registeredProvider()).toBe('NoopTracerProvider');
    });
  });

  describe('sampling', () => {
    test.each([
      [undefined, 0.1],
      ['', 0.1],
      ['  ', 0.1],
      ['0', 0],
      ['1', 1],
      ['0.25', 0.25],
      [' 0.5 ', 0.5],
    ])('OTEL_TRACES_SAMPLER_ARG=%p gives %p', (value, expected) => {
      expect(loadTracing().parseSampleRatio(value)).toBe(expected);
      expect(warn).not.toHaveBeenCalled();
    });

    test.each([['abc'], ['-0.1'], ['1.5'], ['NaN'], ['Infinity']])(
      'OTEL_TRACES_SAMPLER_ARG=%p falls back to 0.1 with a warning',
      (value) => {
        expect(loadTracing().parseSampleRatio(value)).toBe(0.1);
        expect(warn).toHaveBeenCalledTimes(1);
      },
    );

    test('new traces follow the ratio, child spans follow the parent', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
      process.env.OTEL_SERVICE_NAME = 'sales';
      process.env.OTEL_TRACES_SAMPLER_ARG = '0';
      loadTracing().startTracing();
      const tracer = trace.getTracer('test');

      expect(tracer.startSpan('root').isRecording()).toBe(false);

      const sampledParent = trace.setSpanContext(context.active(), {
        traceId: '0af7651916cd43dd8448eb211c80319c',
        spanId: 'b7ad6b7169203331',
        traceFlags: 1,
        isRemote: true,
      });
      const unsampledParent = trace.setSpanContext(context.active(), {
        traceId: '0af7651916cd43dd8448eb211c80319d',
        spanId: 'b7ad6b7169203332',
        traceFlags: 0,
        isRemote: true,
      });

      const child = tracer.startSpan('child', {}, sampledParent);
      expect(child.isRecording()).toBe(true);
      expect(child.spanContext().traceId).toBe(
        '0af7651916cd43dd8448eb211c80319c',
      );
      expect(tracer.startSpan('child', {}, unsampledParent).isRecording()).toBe(
        false,
      );
    });
  });

  describe('dropRequestHeadersProcessor', () => {
    test('removes http.request.header.* attributes and keeps the rest', () => {
      const { dropRequestHeadersProcessor } = loadTracing();
      const exporter = new InMemorySpanExporter();
      const provider = new BasicTracerProvider({
        spanProcessors: [
          dropRequestHeadersProcessor,
          new SimpleSpanProcessor(exporter),
        ],
      });

      const span = provider.getTracer('test').startSpan('POST /graphql', {
        attributes: {
          'http.request.method': 'POST',
          'http.request.header.cookie': 'auth-token=secret',
        },
      });
      span.setAttribute('http.request.header.user', 'eyJ1c2VyIjoiYWRtaW4ifQ==');
      span.setAttribute('http.request.header.x-forwarded-for', '10.0.0.1');
      span.setAttribute('http.response.status_code', 200);
      span.end();

      const [exported] = exporter.getFinishedSpans();

      expect(exported.attributes).toEqual({
        'http.request.method': 'POST',
        'http.response.status_code': 200,
      });
    });
  });
});
