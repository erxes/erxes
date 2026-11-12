import { isSpanContextValid, SpanStatusCode, trace } from '@opentelemetry/api';
import { ORPCError } from '@orpc/server';
import pino, { type LoggerOptions } from 'pino';
import { config } from '~/config';

/** Field names whose values never reach a log line. */
const SECRET_FIELDS = [
  'password',
  'currentPassword',
  'newPassword',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'clientSecret',
  'secretAccessKey',
  'apiKey',
  'signature',
];

/**
 * JSON lines on stdout. With tracing on (src/instrumentation.ts) each line
 * written inside a span carries `trace_id` and `span_id`.
 */
export const loggerOptions: LoggerOptions = {
  level: config.log.level,
  // Read from the active span on every line, so it works however pino was
  // loaded (@opentelemetry/instrumentation-pino only patches `require`).
  mixin: () => {
    const span = trace.getActiveSpan()?.spanContext();

    return span && isSpanContextValid(span) ? { trace_id: span.traceId, span_id: span.spanId } : {};
  },
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]',
    // At the top of a line and one level down (`{ input: { password } }`).
    ...SECRET_FIELDS.flatMap((field) => [field, `*.${field}`]),
  ],
  hooks: {
    // oRPC's logging plugin logs every error a procedure throws. A 4xx is an
    // answer to the caller, not a failure: it goes out at info with its code.
    logMethod(args, method) {
      const [first] = args;

      if (first instanceof ORPCError && first.status < 500) {
        this.info({ code: first.code, status: first.status }, first.message);

        return;
      }

      method.apply(this, args);
    },
  },
};

/**
 * The process logger. Requests log through `req.log` (Express) or
 * `context.log` (procedures); background work through
 * `logger.child({ component })`.
 */
export const logger = pino(
  loggerOptions,
  config.log.pretty ? pino.transport({ target: 'pino-pretty' }) : undefined,
);

const tracer = trace.getTracer('erxes-core');

/**
 * Runs background work (an event consumer's batch, the cleanup) in its own
 * span, so its queries and log lines share one trace.
 */
export const traced = <T>(name: string, run: () => Promise<T>) =>
  tracer.startActiveSpan(name, async (span) => {
    try {
      return await run();
    } catch (error) {
      span.recordException(error instanceof Error ? error : String(error));
      span.setStatus({ code: SpanStatusCode.ERROR });

      throw error;
    } finally {
      span.end();
    }
  });
