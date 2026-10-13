import {
  context,
  propagation,
  ProxyTracerProvider,
  trace,
} from '@opentelemetry/api';

jest.mock('@sentry/node', () => ({
  ...jest.requireActual('@sentry/node'),
  init: jest.fn(),
  getClient: jest.fn(),
  getGlobalScope: jest.fn(),
}));

type SentryMock = {
  init: jest.Mock;
  getClient: jest.Mock;
  getGlobalScope: jest.Mock;
};

const ENV_KEYS = [
  'SENTRY_DSN',
  'SENTRY_SERVER_NAME',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_SERVICE_NAME',
  'OTEL_TRACES_SAMPLER_ARG',
] as const;

// Fresh sentry-init + tracing module state and a fresh Sentry mock per test.
const load = () => {
  let initErxesSentry!: typeof import('./sentry-init').initErxesSentry;
  let Sentry!: SentryMock;
  jest.isolateModules(() => {
    ({ initErxesSentry } = require('./sentry-init'));
    Sentry = require('@sentry/node');
  });
  return { initErxesSentry, Sentry };
};

const registeredProvider = () =>
  (trace.getTracerProvider() as ProxyTracerProvider).getDelegate().constructor
    .name;

describe('initErxesSentry', () => {
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

  test('does nothing without SENTRY_DSN', () => {
    const { initErxesSentry, Sentry } = load();

    initErxesSentry();

    expect(Sentry.init).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  test('without SENTRY_DSN an OTLP endpoint only warns, once', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
    const { initErxesSentry, Sentry } = load();

    initErxesSentry();
    initErxesSentry();

    expect(Sentry.init).not.toHaveBeenCalled();
    expect(registeredProvider()).toBe('NoopTracerProvider');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('SENTRY_DSN');
  });

  test('without an OTLP endpoint Sentry keeps its own OpenTelemetry setup', () => {
    process.env.SENTRY_DSN = 'https://key@glitchtip.example.com/1';
    const { initErxesSentry, Sentry } = load();

    initErxesSentry(undefined, 'core-api');

    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const options = Sentry.init.mock.calls[0][0];
    expect(options).toMatchObject({
      dsn: 'https://key@glitchtip.example.com/1',
      serverName: 'core-api',
      tracesSampleRate: 0,
    });
    expect(options).not.toHaveProperty('skipOpenTelemetrySetup');
    expect(options).not.toHaveProperty('propagateTraceparent');
    expect(registeredProvider()).toBe('NoopTracerProvider');
    expect(warn).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  test('with an OTLP endpoint Sentry skips its OpenTelemetry setup and our provider is registered', () => {
    process.env.SENTRY_DSN = 'https://key@glitchtip.example.com/1';
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
    process.env.OTEL_SERVICE_NAME = 'sales';
    const { initErxesSentry, Sentry } = load();

    initErxesSentry();

    expect(Sentry.init).toHaveBeenCalledTimes(1);
    expect(Sentry.init.mock.calls[0][0]).toMatchObject({
      skipOpenTelemetrySetup: true,
      propagateTraceparent: true,
      tracesSampleRate: 0,
    });
    expect(registeredProvider()).toBe('BasicTracerProvider');
    expect(propagation.fields()).toEqual(['traceparent', 'tracestate']);
  });
});
