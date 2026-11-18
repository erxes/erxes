import { LOG_REDACT } from '@erxes/plugin-sdk/logger';
import { pino, type LoggerOptions } from 'pino';
import { config, PLUGIN } from '#/config.ts';

/** Credentials and secret fields never reach a line: the same list core's logger redacts. */
export const loggerOptions: LoggerOptions = {
  name: PLUGIN,
  level: config.logLevel,
  redact: LOG_REDACT,
};

/** JSON logs on stdout. With OpenTelemetry on, each line carries its trace id. */
export const logger = pino(loggerOptions);
