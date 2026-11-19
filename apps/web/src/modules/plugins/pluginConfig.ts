import type { Icon as TablerIcon } from '@tabler/icons-react';
import {
  DASHBOARD_WIDGET_PREVIEWS,
  INTEGRATION_CATEGORIES,
  type TContactContentType,
  type TDashboardWidget,
  type TPanelRecordType,
  type TPluginIntegration,
  type TPluginSettingsPage,
  type TPropertyLimit,
  type TRecordContacts,
  type TRecordDraftProps,
  type TRecordProperties,
  type TRecordSection,
  type TRecordSectionProps,
  type TRecordSlotProps,
  type TRecordTab,
  type TRelationTab,
  type TRelationTabProps,
} from 'erxes-ui';
import { Country, PluginRecordType } from '@erxes/core-contract';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { ComponentType, ElementType } from 'react';
import { z } from 'zod';
import type { LoadedPluginConfig } from './types';

const isComponent = (value: unknown) =>
  typeof value === 'function' || (typeof value === 'object' && value !== null);

const isFunction = (value: unknown) => typeof value === 'function';

const component = <P>() => z.custom<ComponentType<P>>(isComponent);

/** Where a plugin's pages mount: `/<path>`, however its `path` is written. */
export const pluginBasePath = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}`;

const Icon = component<{ className?: string }>();

const TabIcon = z.custom<TablerIcon>(isComponent);

const Config = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  icon: Icon.optional(),
  modules: z
    .array(z.object({ name: z.string(), path: z.string(), icon: Icon.optional() }))
    .optional(),
  checkAccess: z.custom<() => Promise<boolean>>(isFunction).optional(),
  recordSections: z.unknown().optional(),
  recordTypes: z.unknown().optional(),
  relationTabs: z.unknown().optional(),
  settings: z.unknown().optional(),
  integrations: z.unknown().optional(),
  dashboardWidgets: z.unknown().optional(),
  floatingWidget: z.unknown().optional(),
});

const FloatingWidget = component().optional();

/** A settings page is one of the plugin's own, under its `path`. */
const settingsPageSchema = (path: string) => {
  const base = pluginBasePath(path);

  return z.object({
    path: z.string().startsWith(`${base}/`, `is not under ${base}/`),
    label: z.string().min(1),
    icon: z.custom<ElementType>(isComponent).optional(),
  }) satisfies z.ZodType<TPluginSettingsPage>;
};

const RecordSection = z.object({
  contentType: z.custom<TContactContentType>(
    (value) => value === 'core:customer' || value === 'core:company',
  ),
  title: z.string().min(1),
  icon: z.custom<ElementType>(isComponent),
  component: component<TRecordSectionProps>(),
});

const RecordTab = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  icon: TabIcon,
  expandedOnly: z.boolean().optional(),
  after: z
    .custom<TRecordTab['after']>((value) => value === 'detail' || value === 'activity')
    .optional(),
  component: component<TRecordSlotProps>(),
}) satisfies z.ZodType<TRecordTab>;

const RelationTab = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  icon: TabIcon,
  hosts: z.array(z.string().min(1)).optional(),
  component: component<TRelationTabProps>(),
}) satisfies z.ZodType<TRelationTab>;

const DashboardWidget = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.custom<ElementType>(isComponent),
  preview: z.enum(DASHBOARD_WIDGET_PREVIEWS).optional(),
  size: z.object({ w: z.int().positive(), h: z.int().positive() }).optional(),
  component: component<object>(),
}) satisfies z.ZodType<TDashboardWidget>;

const Integration = z.object({
  key: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'is not lowercase letters, digits and dashes'),
  name: z.string().min(1),
  summary: z.string().min(1),
  icon: TabIcon,
  category: z.enum(INTEGRATION_CATEGORIES),
  countries: z.array(Country).optional(),
  permission: z.string().regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, 'is not a permission'),
  tabs: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1), component: component() }))
    .min(1),
}) satisfies z.ZodType<TPluginIntegration>;

/** The address a `detailPath` gives a sample id, if it gives one. */
const samplePath = (detailPath: (id: string) => unknown) => {
  try {
    const path = detailPath('id');

    return typeof path === 'string' ? path : null;
  } catch {
    return null;
  }
};

/** A record type is the plugin's own (`<name>:<thing>`) and its page is under the plugin's. */
const recordTypeSchema = (name: string, path: string) => {
  const base = pluginBasePath(path);

  return z.object({
    contentType: z
      .string()
      .regex(/^[^\s/:]+:[^\s/:]+$/, 'is not <plugin>:<thing>')
      .refine(
        (type) => type.toLowerCase().startsWith(`${name.toLowerCase()}:`),
        `does not start with "${name}:"`,
      ),
    title: z.string().min(1),
    icon: z.custom<ElementType>(isComponent),
    detailPath: z
      .custom<(contentId: string) => string>(isFunction)
      .refine(
        (detailPath) => samplePath(detailPath)?.startsWith(`${base}/`) ?? false,
        `does not give a page under ${base}/`,
      ),
    Title: component<TRecordSlotProps>(),
    Actions: component<TRecordSlotProps>().optional(),
    Detail: component<TRecordSlotProps>(),
    tabs: z.array(RecordTab).optional(),
    New: component<TRecordDraftProps>().optional(),
    contacts: z
      .custom<(contentId: string) => UseQueryOptions<TRecordContacts, Error, TRecordContacts>>(
        isFunction,
      )
      .optional(),
    activity: z.string().min(1).optional(),
    properties: z
      .object({
        type: PluginRecordType.refine(
          (type) => type.startsWith(`${name.toLowerCase()}.`),
          `does not start with "${name}."`,
        ),
        values: z.custom<TRecordProperties['values']>(isFunction),
        save: z.custom<TRecordProperties['save']>(isFunction),
        limits: z
          .array(
            z.object({
              key: z.string().regex(/^[a-z][a-z0-9_]{0,29}$/),
              label: z.string().min(1),
              options: z.custom<TPropertyLimit['options']>(
                (value) => typeof value === 'object' && value !== null,
              ),
            }),
          )
          .max(5)
          .optional(),
        appliesTo: z.custom<NonNullable<TRecordProperties['appliesTo']>>(isFunction).optional(),
      })
      .refine((value) => !value.limits?.length || value.appliesTo, {
        path: ['appliesTo'],
        error: 'needed with limits',
      })
      .optional(),
  }) satisfies z.ZodType<TPanelRecordType>;
};

/** The entries of a list that parse; a broken one is logged and left out. */
const validEntries = <T>(
  remote: string,
  key: string,
  value: unknown,
  schema: z.ZodType<T>,
): T[] => {
  const list = z.array(z.unknown()).optional().safeParse(value);

  if (!list.success) {
    console.error(`[plugins] ${remote}: ${key} is not a list`);

    return [];
  }

  return (list.data ?? []).flatMap((entry, index) => {
    const parsed = schema.safeParse(entry);

    if (parsed.success) return [parsed.data];

    console.error(`[plugins] ${remote}: ${key}[${index}] is not valid`, parsed.error.issues);

    return [];
  });
};

/**
 * A plugin's `CONFIG`, with only its well-formed sections, record types, relation tabs,
 * settings pages, integrations, dashboard widgets and floating widget; null when it has no name
 * or path.
 */
export const parsePluginConfig = (remote: string, value: unknown): LoadedPluginConfig | null => {
  const config = Config.safeParse(value);

  if (!config.success) return null;

  const {
    recordSections,
    recordTypes,
    relationTabs,
    settings,
    integrations,
    dashboardWidgets,
    floatingWidget,
    ...rest
  } = config.data;

  const widget = FloatingWidget.safeParse(floatingWidget);

  if (!widget.success) console.error(`[plugins] ${remote}: floatingWidget is not a component`);

  const sections: TRecordSection[] = validEntries(
    remote,
    'recordSections',
    recordSections,
    RecordSection,
  );

  return {
    ...rest,
    recordSections: sections,
    recordTypes: validEntries(
      remote,
      'recordTypes',
      recordTypes,
      recordTypeSchema(rest.name, rest.path),
    ),
    relationTabs: validEntries(remote, 'relationTabs', relationTabs, RelationTab),
    settings: validEntries(remote, 'settings', settings, settingsPageSchema(rest.path)),
    integrations: validEntries(remote, 'integrations', integrations, Integration),
    dashboardWidgets: validEntries(remote, 'dashboardWidgets', dashboardWidgets, DashboardWidget),
    floatingWidget: widget.success ? widget.data : undefined,
  };
};
