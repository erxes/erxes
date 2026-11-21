import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_FORM_FIELD_TYPES,
  INTEGRATION_HOOKS,
} from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { IntegrationDataKey, IntegrationKey } from './integrationValues';
import { Country } from './money';

export { INTEGRATION_CATEGORIES };

export const INTEGRATION_FORM_FIELD_MAX = 20;

export const INTEGRATION_ACCOUNT_KIND_MAX = 10;

export const PLUGIN_INTEGRATION_MAX = 50;

export const INTEGRATION_CANDIDATE_MAX = 500;

export const INTEGRATION_ACCOUNT_MAX = 200;

const Label = z.string().trim().min(1).max(100);

export const IntegrationFormField = z.object({
  key: IntegrationDataKey,
  label: Label,
  type: z.enum(INTEGRATION_FORM_FIELD_TYPES),
  required: z.boolean().default(false),
  options: z
    .array(z.object({ value: z.string().max(200), label: Label }))
    .max(100)
    .optional(),
  description: z.string().trim().max(300).optional(),
  placeholder: z.string().trim().max(100).optional(),
});

export type IntegrationFormField = z.infer<typeof IntegrationFormField>;

const FormFields = z
  .array(IntegrationFormField)
  .min(1)
  .max(INTEGRATION_FORM_FIELD_MAX)
  .refine(
    (fields) => new Set(fields.map((field) => field.key)).size === fields.length,
    'each field key once',
  )
  .refine(
    (fields) => fields.every((field) => (field.type === 'select') === !!field.options?.length),
    'a select field lists its options, and no other field does',
  );

export const IntegrationAccountKind = z.object({
  kind: IntegrationKey,
  label: Label,
  plural: Label,
});

export const IntegrationConnect = z.discriminatedUnion('type', [
  z.object({ type: z.literal('form'), fields: FormFields }),
  z.object({ type: z.literal('redirect') }),
]);

export const IntegrationSetupForm = z.object({ fields: FormFields });

export const PluginIntegration = z.object({
  key: IntegrationKey,
  name: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(200),
  category: z.enum(INTEGRATION_CATEGORIES),
  countries: z.array(Country).max(250).optional(),
  permission: z.string().trim().max(100).optional(),
  accounts: z
    .array(IntegrationAccountKind)
    .min(1)
    .max(INTEGRATION_ACCOUNT_KIND_MAX)
    .refine(
      (kinds) => new Set(kinds.map((item) => item.kind)).size === kinds.length,
      'each account kind once',
    ),
  connect: IntegrationConnect,
  pick: z.boolean().default(false),
  setup: IntegrationSetupForm.optional(),
  hooks: z.array(z.enum(INTEGRATION_HOOKS)).max(INTEGRATION_HOOKS.length).default([]),
});

export type PluginIntegration = z.infer<typeof PluginIntegration>;

export const PluginIntegrations = z
  .array(PluginIntegration)
  .max(PLUGIN_INTEGRATION_MAX)
  .refine(
    (list) => new Set(list.map((item) => item.key)).size === list.length,
    'each integration key once',
  );

export const IntegrationRef = z
  .string()
  .regex(/^[a-z][a-z0-9_]{0,39}\.[a-z][a-z0-9_]{0,39}$/, 'an integration, like frontline.meta');

export const pluginIntegrationRef = (plugin: string, key: string) => `${plugin}.${key}`;

export const CUSTOM_INTEGRATION_OWNER = 'custom';

export const customIntegrationRef = (key: string) => `${CUSTOM_INTEGRATION_OWNER}.${key}`;

export const IntegrationCandidate = z.object({
  kind: IntegrationKey,
  externalId: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  detail: z.string().trim().max(200).nullable().default(null),
  config: z.record(z.string(), z.unknown()).default({}),
  secret: z.record(z.string(), z.unknown()),
});

export type IntegrationCandidate = z.infer<typeof IntegrationCandidate>;

export const IntegrationCandidates = z
  .array(IntegrationCandidate)
  .max(INTEGRATION_CANDIDATE_MAX)
  .refine(
    (list) => new Set(list.map((item) => `${item.kind}:${item.externalId}`)).size === list.length,
    'each account once',
  );

export const IntegrationFormValue = z.union([z.string().max(4000), z.number(), z.boolean()]);

export const IntegrationFormValues = z.record(IntegrationDataKey, IntegrationFormValue.nullable());

export type IntegrationFormValues = z.infer<typeof IntegrationFormValues>;

const SecretValues = z.record(z.string(), z.unknown());

export const IntegrationHookAccount = z.object({
  id: z.string(),
  kind: IntegrationKey,
  externalId: z.string(),
  name: z.string(),
  detail: z.string().nullable(),
  config: z.record(z.string(), z.unknown()),
  secret: SecretValues,
});

export type IntegrationHookAccount = z.infer<typeof IntegrationHookAccount>;

const hookCall = {
  callId: z.string(),
  orgId: z.string(),
  userId: z.string().nullable(),
  integration: IntegrationKey,
  setup: SecretValues.nullable(),
};

export const IntegrationHookCall = z.discriminatedUnion('hook', [
  z.object({ hook: z.literal('start'), ...hookCall }),
  z.object({ hook: z.literal('connect'), ...hookCall, values: IntegrationFormValues }),
  z.object({ hook: z.literal('connected'), ...hookCall, account: IntegrationHookAccount }),
  z.object({ hook: z.literal('check'), ...hookCall, account: IntegrationHookAccount }),
  z.object({ hook: z.literal('disconnect'), ...hookCall, account: IntegrationHookAccount }),
]);

export type IntegrationHookCall = z.infer<typeof IntegrationHookCall>;

export const IntegrationStartAnswer = z.object({ url: z.string().max(4000) });

export const IntegrationConnectAnswer = z.object({ candidates: IntegrationCandidates });

export const IntegrationCheckAnswer = z.object({
  error: z.string().trim().min(1).max(500).nullable(),
});

export const IntegrationRefusal = z.object({ message: z.string().trim().min(1).max(500) });
