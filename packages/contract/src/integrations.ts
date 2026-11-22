import {
  GATEWAY_REFUND_KINDS,
  INTEGRATION_CONNECTION_STATUSES,
  INTEGRATION_FIELD_TYPES,
} from '@erxes/core-db/enums';
import { integrationConnections, pluginIntegrationStates } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ActionInfo } from './automationRuns';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { Country } from './money';
import { IntegrationCategory, IntegrationKey } from './values';

export const IntegrationConnection = createSelectSchema(integrationConnections, {
  id: Id,
  createdAt: isoDate,
})
  .pick({ id: true, key: true, name: true, status: true, createdAt: true })
  .extend({
    /** Non-secret settings, for display (`invoiceCode`, `sandbox`). */
    settings: z.record(z.string(), z.unknown()),
  });

export type IntegrationConnection = z.infer<typeof IntegrationConnection>;

export const VaultConnection = IntegrationConnection.extend({
  usedBy: z.array(z.string()),
});

export type VaultConnection = z.infer<typeof VaultConnection>;

export const IntegrationField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(INTEGRATION_FIELD_TYPES),
  optional: z.boolean(),
  /** A `select` field's values. */
  options: z.array(z.string()).optional(),
});

export type IntegrationField = z.infer<typeof IntegrationField>;

const stateColumns = { count: () => z.int().min(0) };

/** Where an integration stands here; `count`: how many are connected, when known. */
export const IntegrationStatus = createSelectSchema(pluginIntegrationStates, stateColumns).pick({
  state: true,
  count: true,
});

export type IntegrationStatus = z.infer<typeof IntegrationStatus>;

export const IntegrationPayments = z.object({
  currencies: z.array(z.string()),
  refunds: z.enum(GATEWAY_REFUND_KINDS),
  pays: z.string(),
});

/** An action it brings to automations (`qpay.invoice.create`), as the builder lists it. */
export const IntegrationAction = ActionInfo.pick({ type: true, label: true, description: true });

export const Integration = z.object({
  key: z.string(),
  /** The plugin whose manifest declares it; null for core's own. */
  plugin: z.string().nullable(),
  name: z.string(),
  summary: z.string(),
  category: IntegrationCategory,
  countries: z.array(z.string()),
  permission: z.string(),
  dashboard: z.string().nullable(),
  keyed: z.boolean(),
  fields: z.array(IntegrationField),
  payments: IntegrationPayments.nullable(),
  status: IntegrationStatus,
  actions: z.array(IntegrationAction),
});

export type Integration = z.infer<typeof Integration>;

/**
 * An integration a plugin brings to Settings › Integrations (`facebook`), listed next to core's
 * for members with `integrations.manage` and `permission`, one of the manifest's own
 * permissions. The plugin keeps its keys in core's vault (`secrets.*`), draws the page's tabs
 * in its UI, and reports where it stands with `integrations.report`.
 */
export const PluginIntegration = z.object({
  /** Unique within the plugin; its page is `/settings/integrations/<plugin>.<key>`. */
  key: IntegrationKey,
  name: z.string().trim().min(1).max(80),
  /** One line on its tile and under its name. */
  summary: z.string().trim().min(1).max(300),
  category: IntegrationCategory,
  /** The ISO 3166 countries it serves (`MN`); none: any. */
  countries: z.array(Country).max(250).optional(),
  permission: z.string().trim().min(1).max(100),
});

/** The manifest's `integrations`, each key once, at most 20. */
export const PluginIntegrations = z
  .array(PluginIntegration)
  .max(20)
  .refine(
    (list) => new Set(list.map((integration) => integration.key)).size === list.length,
    'each key once',
  );

const ReportedState = createUpdateSchema(pluginIntegrationStates, stateColumns)
  .pick({ state: true, count: true })
  .required({ state: true });

const ConnectionName = z.string().trim().min(1).max(80);

const ConnectionKeys = z.record(z.string(), z.unknown());

const { BANK_IN_USE, GATEWAY_IN_USE, GATEWAY_REFUSED, KIND_CHANGED } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  BANK_IN_USE,
  GATEWAY_IN_USE,
  GATEWAY_REFUSED,
  KIND_CHANGED,
});

export const integrationsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/integrations',
      summary:
        "The integrations the member may manage, core's with their form fields and those of the plugins installed here, with their state",
    })
    .output(listOf(Integration)),
  connections: base
    .route({
      method: 'GET',
      path: '/integrations/connections',
      summary:
        'The connections the member may manage, of one integration or of all, with their settings and what uses them but never their secrets',
    })
    .input(z.object({ key: IntegrationKey.optional() }))
    .output(listOf(VaultConnection)),
  connect: base
    .route({
      method: 'POST',
      path: '/integrations/{key}/connections',
      successStatus: 201,
      summary: 'Connect with these keys, checked against the service first. 400 GATEWAY_REFUSED',
    })
    .input(z.object({ key: IntegrationKey, name: ConnectionName, keys: ConnectionKeys }))
    .output(IntegrationConnection),
  update: base
    .route({
      method: 'PATCH',
      path: '/integrations/{key}/connections/{id}',
      summary:
        'Rename, turn off or on, or change the keys (checked first). 400 GATEWAY_REFUSED; 400 KIND_CHANGED when the connection is of another integration',
    })
    .input(
      z.object({
        key: IntegrationKey,
        id: Id,
        name: ConnectionName.optional(),
        keys: ConnectionKeys.optional(),
        status: z.enum(INTEGRATION_CONNECTION_STATUSES).optional(),
      }),
    )
    .output(IntegrationConnection),
  remove: base
    .route({
      method: 'DELETE',
      path: '/integrations/{key}/connections/{id}',
      summary:
        'Remove a connection. 409 GATEWAY_IN_USE when a gateway has invoices: turn it off instead',
    })
    .input(z.object({ key: IntegrationKey, id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  report: base
    .route({
      method: 'PUT',
      path: '/integrations/{key}/state',
      summary:
        "The calling plugin says where one of its manifest's integrations stands in this organisation (`count`: how many are connected). 404 when its manifest doesn't declare the key",
    })
    .input(ReportedState.extend({ key: IntegrationKey }))
    .output(IntegrationStatus),
};
