import type { Icon } from '@tabler/icons-react';
import {
  type IComposerActionProps,
  type IExtensionUIConfig,
  type IRecordPlacementProps,
  RECORD_CONTENT_TYPES,
} from 'erxes-ui';
import type { ComponentType } from 'react';
import { z } from 'zod';

// A function component, or an object one (memo, forwardRef, lazy).
const isComponent = (value: unknown) =>
  typeof value === 'function' ||
  (typeof value === 'object' && value !== null && '$$typeof' in value);

const component = <P extends object = object>() =>
  z.custom<ComponentType<P>>(
    isComponent,
    'must be a component, e.g. extensionComponent(() => import("./Notes"))',
  );
const name = z
  .string()
  .regex(/^[A-Za-z][\w-]*$/, 'must be a name, e.g. "notes"');
const label = z.string().min(1);
const icon = z.custom<Icon>(
  isComponent,
  'must be a component, e.g. a @tabler/icons-react icon',
);
const contentType = z.enum(RECORD_CONTENT_TYPES);

// The runtime names an extension's remote and permissions after its id:
// `deal-insights` is `dealInsights_ui` and permission plugin `dealInsights`.
const toPluginName = (extId: string) =>
  extId.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const extensionConfigSchema = (remoteName: string, hosts: string[]) =>
  z
    .object({
      id: z
        .string()
        .regex(/^[a-z][a-z0-9-]*$/, 'must be the extension id')
        .refine(
          (id) => `${toPluginName(id)}_ui` === remoteName,
          `must be the id this remote was installed as (${remoteName})`,
        ),
      label,
      icon: icon.optional(),
      host: z
        .string()
        .refine(
          (host) => hosts.includes(host),
          `must be one of the loaded plugins: ${hosts.join(', ')}`,
        ),
      pages: z
        .array(
          z.object({
            label,
            path: z
              .string()
              .regex(
                /^[\w-]+(\/[\w-]+)*$/,
                'must be relative to the host, e.g. "insights"',
              ),
            icon: icon.optional(),
            component: component(),
          }),
        )
        .optional(),
      sideTabs: z
        .array(
          z.object({
            name,
            label,
            icon,
            contentTypes: z.array(contentType).min(1),
            component: component<IRecordPlacementProps>(),
          }),
        )
        .optional(),
      recordActions: z.record(contentType, component()).optional(),
      recordColumns: z
        .record(
          contentType,
          z.array(
            z.object({
              name,
              label,
              component: component<IRecordPlacementProps>(),
            }),
          ),
        )
        .optional(),
      composerActions: z
        .array(
          z.object({
            id: z.string().min(1),
            label,
            icon,
            component: component<IComposerActionProps>(),
          }),
        )
        .optional(),
    })
    .refine((config) => config.host !== 'core' || !config.pages?.length, {
      path: ['pages'],
      message: 'core has no app sidebar for pages; host them in a plugin',
    });

export type TExtensionConfigResult =
  | { ok: true; pluginName: string; config: IExtensionUIConfig }
  | { ok: false; message: string };

/**
 * Validate an extension remote's `CONFIG`. `hosts` are the plugins it may
 * live in: every loaded plugin, and `core`.
 */
export const validateExtensionConfig = (
  remoteName: string,
  value: unknown,
  hosts: string[],
): TExtensionConfigResult => {
  const result = extensionConfigSchema(remoteName, hosts).safeParse(value);

  if (result.success) {
    return {
      ok: true,
      pluginName: remoteName.replace(/_ui$/, ''),
      config: result.data,
    };
  }

  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'CONFIG'}: ${issue.message}`)
    .join('\n');

  return {
    ok: false,
    message: `[erxes] Extension "${remoteName}" was not loaded: its ./config CONFIG is invalid.\n${problems}`,
  };
};
