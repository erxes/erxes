import {
  context,
  propagation,
  ProxyTracerProvider,
  trace,
} from '@opentelemetry/api';

export const registeredProvider = () =>
  (trace.getTracerProvider() as ProxyTracerProvider).getDelegate().constructor
    .name;

export const useOtelTestEnv = (envKeys: readonly string[]) => {
  const savedEnv: Record<string, string | undefined> = {};
  const spies = {} as { warn: jest.SpyInstance; log: jest.SpyInstance };

  beforeEach(() => {
    for (const key of envKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    spies.warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    spies.log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    trace.disable();
    propagation.disable();
    context.disable();
    jest.restoreAllMocks();
    for (const key of envKeys) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  return spies;
};
