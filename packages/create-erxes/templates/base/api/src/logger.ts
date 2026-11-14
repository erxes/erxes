import { pino } from 'pino';
import { config, PLUGIN } from '#/config.ts';

/** JSON logs on stdout. With OpenTelemetry on, each line carries its trace id. */
export const logger = pino({ name: PLUGIN, level: config.logLevel });
