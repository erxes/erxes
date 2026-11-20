import { BOOLEAN_STRINGS } from '@erxes/core-db/enums';
import { z } from 'zod';

/** How `config.ts` reads one environment setting. Blank counts as unset; values are trimmed. */
export const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || undefined : value),
    schema.optional(),
  );

export const text = optional(z.string());

export const flag = optional(z.enum(BOOLEAN_STRINGS).transform((value) => value === 'true'));

export const positive = (fallback: number) =>
  optional(z.coerce.number().positive()).transform((value) => value ?? fallback);

export const baseUrl = (fallback: string) =>
  optional(z.url())
    .transform((value) => value ?? fallback)
    .transform((value) => value.replace(/\/+$/, ''));

/** Comma-separated values, each trimmed; none when unset. */
export const list = optional(z.string()).transform((value) =>
  (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
);

const PLUGIN_NAME = /^[a-z][a-z0-9_]{0,39}$/;

/**
 * Plugin client secrets, `hr:<secret>,ecom:<secret>`, as secret → plugin name.
 * They are registered (hashed) in `core_plugins` at startup; a plugin trades
 * its secret for short-lived tokens (`POST /core/v1/plugins/token`) and never
 * sends it on API calls. `pnpm plugin:secret <name>` rotates one.
 */
export const pluginKeys = optional(z.string()).transform((value, ctx) => {
  const keys = new Map<string, string>();

  for (const entry of (value ?? '').split(',')) {
    const separator = entry.indexOf(':');
    const name = entry.slice(0, separator).trim().toLowerCase();
    const secret = entry.slice(separator + 1).trim();

    if (separator < 1 || !secret) continue;

    if (!PLUGIN_NAME.test(name) || name === 'core') {
      ctx.addIssue({ code: 'custom', message: `"${name}" is not a valid plugin name` });
    } else if (secret.length < 32) {
      ctx.addIssue({
        code: 'custom',
        message: `the key for "${name}" needs 32 characters or more`,
      });
    } else {
      keys.set(secret, name);
    }
  }

  return keys;
});
