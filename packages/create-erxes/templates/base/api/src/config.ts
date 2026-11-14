import { z } from 'zod';

/** The plugin's name in core: tables, permissions, events and the UI remote all start with it. */
export const PLUGIN = '__id__';

/** Every setting the API reads. Nothing else touches `process.env`. */
const Env = z.object({
  PORT: z.coerce.number().int().positive().default(__apiPort__),
  /** Postgres as the plugin's own role (`pnpm db:plugin-role __id__` in core). */
  DATA_URL: z.url(),
  /** Core's address, without `/core/v1`. */
  CORE_URL: z.url(),
  /** This plugin's secret from core's `CORE_PLUGIN_KEYS`. */
  PLUGIN_SECRET: z.string().min(32),
  /** Where core and browsers reach this API. */
  PUBLIC_URL: z.url().default('http://localhost:__apiPort__'),
  /** The UI remote's entry; the built UI is served at `/ui` unless this points elsewhere. */
  UI_ENTRY_URL: z.url().optional(),
  /** The built UI to serve at `/ui` (the image sets it). */
  UI_DIR: z.string().optional(),
  /** core-ui's origin, which calls this API from the browser. Defaults to CORE_URL's origin. */
  CORE_UI_URL: z.url().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  VERSION: z.string().default('0.1.0'),
  /** Traces go to this OTLP collector; the SDK reads the other OTEL_* variables itself. */
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
});

const env = Env.parse(process.env);

export const config = {
  port: env.PORT,
  dataUrl: env.DATA_URL,
  coreUrl: env.CORE_URL,
  pluginSecret: env.PLUGIN_SECRET,
  publicUrl: env.PUBLIC_URL.replace(/\/+$/, ''),
  uiEntryUrl: env.UI_ENTRY_URL ?? `${env.PUBLIC_URL.replace(/\/+$/, '')}/ui/remoteEntry.js`,
  uiDir: env.UI_DIR,
  coreUiOrigin: new URL(env.CORE_UI_URL ?? env.CORE_URL).origin,
  logLevel: env.LOG_LEVEL,
  version: env.VERSION,
  tracing: Boolean(env.OTEL_EXPORTER_OTLP_ENDPOINT),
};
