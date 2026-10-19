import { IUIConfig } from 'erxes-ui';
import { satisfiesPlatformRange } from '~/plugins/utils/platformVersion';
import { z } from 'zod';

const pathSchema = z
  .string()
  .min(1)
  .regex(
    /^[\w-]+(\/[\w:.-]+)*$/,
    'must be a relative path such as "sales" or "sales/deals" (no leading or trailing "/")',
  );

/**
 * The parts of a plugin's `./config` that core relies on. Everything else
 * passes through untouched so plugins can carry their own extensions.
 */
const pluginConfigSchema = z
  .object({
    name: z.string().min(1),
    path: pathSchema,
    platform: z
      .string()
      .refine(
        (range) => satisfiesPlatformRange('0.0.0', range) !== null,
        'must be a semver range such as "~3.2" or ">=3.2.25 <3.4"',
      )
      .optional(),
    navigationGroup: z
      .object({
        name: z.string().min(1),
        defaultPath: pathSchema.optional(),
        icon: z.any(),
      })
      .passthrough()
      .optional(),
    modules: z
      .array(
        z.object({ name: z.string().min(1), path: pathSchema }).passthrough(),
      )
      .optional(),
  })
  .passthrough();

export type TPluginConfigResult =
  | { ok: true; config: IUIConfig }
  | { ok: false; message: string };

/** Validate a remote's `CONFIG`, describing every problem in one message. */
export const validatePluginConfig = (
  remoteName: string,
  value: unknown,
): TPluginConfigResult => {
  const result = pluginConfigSchema.safeParse(value);

  if (result.success) {
    return { ok: true, config: value as IUIConfig };
  }

  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'CONFIG'}: ${issue.message}`)
    .join('\n');

  return {
    ok: false,
    message: `[erxes] Plugin "${remoteName}" was not loaded: its ./config CONFIG is invalid.\n${problems}`,
  };
};

/**
 * Message for a plugin built for other platform versions, or null when the
 * plugin declares no range, the range matches, or the host version is unknown.
 */
export const getPlatformMismatch = (
  config: IUIConfig,
  hostVersion: string | undefined,
): string | null => {
  if (!config.platform || !hostVersion) {
    return null;
  }

  if (satisfiesPlatformRange(hostVersion, config.platform) !== false) {
    return null;
  }

  return `Built for erxes ${config.platform}; this is erxes ${hostVersion}.`;
};
