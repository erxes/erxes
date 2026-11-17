jest.mock('./redis', () => ({ redis: {} }));

type MqWorker = typeof import('./mq-worker');

const load = (): MqWorker => {
  let mod: MqWorker | undefined;
  jest.isolateModules(() => {
    mod = require('./mq-worker');
  });
  return mod as MqWorker;
};

describe('queueTelemetry', () => {
  const saved = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    } else {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = saved;
    }
  });

  it('is undefined when tracing is off, so queues and workers behave as before', () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    expect(load().queueTelemetry()).toBeUndefined();
  });

  it('is one shared BullMQ OpenTelemetry instance when tracing is on', () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://127.0.0.1:4318';
    const { queueTelemetry } = load();

    const first = queueTelemetry();

    expect(first?.constructor.name).toBe('BullMQOtel');
    expect(queueTelemetry()).toBe(first);
  });
});
