import {
  APP_TRIGGER_DELIVERIES,
  GATEWAY_REFUND_KINDS,
  INTEGRATION_CONNECTION_STATUSES,
  INTEGRATION_FIELD_TYPES,
  OAUTH_CLIENT_SOURCES,
} from '@erxes/core-db/enums';
import {
  integrationConnections,
  integrationSubscriptions,
  pluginIntegrationStates,
} from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ActionInfo, RecordType } from './automationRuns';
import { Id, isoDate, listOf } from './common';
import { connectionUseContract } from './connectionUse';
import { COMMON_ERRORS, ERRORS } from './errors';
import { Country } from './money';
import { IntegrationCategory, IntegrationKey } from './values';

export const IntegrationConnection = createSelectSchema(integrationConnections, {
  id: Id,
  createdAt: isoDate,
  /** The values a member reads and changes (`invoiceCode`, `sandbox`); never a secret. */
  settings: z.record(z.string(), z.unknown()),
}).pick({ id: true, key: true, name: true, settings: true, status: true, createdAt: true });

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
  /** A trigger setting that is one of the app's records, picked from `records` by this type. */
  recordType: RecordType.optional(),
  /** The key of another setting: its records are the ones under that setting's value. */
  dependsOn: z.string().optional(),
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
  /** A plugin's integration that connects through this core integration's connections; else null. */
  connection: z.string().nullable(),
  name: z.string(),
  summary: z.string(),
  category: IntegrationCategory,
  countries: z.array(z.string()),
  permission: z.string(),
  dashboard: z.string().nullable(),
  keyed: z.boolean(),
  fields: z.array(IntegrationField),
  payments: IntegrationPayments.nullable(),
  /** It texts the organisation's messages (CallPro, Twilio): a portal may text its codes through it. */
  sms: z.boolean(),
  oauth: z
    .object({
      client: z.enum(OAUTH_CLIENT_SOURCES).nullable(),
      callbackUrl: z.string(),
      /** The organisation's own app's client id; null on the server's app or none. */
      clientId: z.string().nullable(),
    })
    .nullable(),
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
  /**
   * The core integration its accounts connect through (`facebook`), one the manifest's
   * `connections` names. It gets no tile of its own: its tabs join that integration's page, which
   * lists it under "Used by".
   */
  connection: IntegrationKey.optional(),
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

export const AutomationAppTrigger = z.object({
  key: z.string(),
  type: z.string(),
  label: z.string(),
  description: z.string(),
  via: z.enum(APP_TRIGGER_DELIVERIES),
  params: z.array(IntegrationField),
});

export const AutomationApp = z.object({
  key: z.string(),
  name: z.string(),
  category: IntegrationCategory,
  triggers: z.array(AutomationAppTrigger),
  /** The record types it lists for pickers (`records`); others are the run's values or typed. */
  records: z.array(RecordType),
  connections: z.array(IntegrationConnection.pick({ id: true, name: true, status: true })),
});

export type AutomationApp = z.infer<typeof AutomationApp>;

export const AppSubscription = createSelectSchema(integrationSubscriptions, {
  id: Id,
  connectionId: Id,
  params: z.record(z.string(), z.unknown()),
  failures: () => z.int(),
  lastDeliveryAt: isoDate,
})
  .pick({
    id: true,
    connectionId: true,
    channel: true,
    params: true,
    status: true,
    lastError: true,
    failures: true,
    lastDeliveryAt: true,
  })
  .extend({
    connectionName: z.string(),
    triggers: z.array(z.object({ key: z.string(), label: z.string() })),
    automations: z.array(z.object({ id: Id, name: z.string() })),
  });

export type AppSubscription = z.infer<typeof AppSubscription>;

const ConnectionName = z.string().trim().min(1).max(80);

const ConnectionKeys = z.record(z.string(), z.unknown());

/** One of an app's records as a picker offers it: its id, and the name a member reads. */
export const AppRecord = z.object({ value: z.string(), label: z.string() });

export type AppRecord = z.infer<typeof AppRecord>;

const {
  APP_IN_USE,
  BANK_IN_USE,
  CONNECTION_IN_USE,
  GATEWAY_IN_USE,
  GATEWAY_REFUSED,
  KIND_CHANGED,
  NOT_CONNECTED,
  NOT_SET_UP,
} = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  APP_IN_USE,
  BANK_IN_USE,
  CONNECTION_IN_USE,
  GATEWAY_IN_USE,
  GATEWAY_REFUSED,
  KIND_CHANGED,
  NOT_CONNECTED,
  NOT_SET_UP,
});

export const integrationsContract = {
  authorize: base
    .route({
      method: 'POST',
      path: '/integrations/{key}/authorize',
      summary: 'Start an app sign-in',
      description:
        "Where to send the member to sign in to the app; the app sends them back to the callback, which saves the connection. One connection per account: signing in again with it renews that connection's sign-in and keeps its name. A new account's connection takes `name`, or else the account's name. 400 NOT_SET_UP without the app's client id and secret",
    })
    .input(z.object({ key: IntegrationKey, name: ConnectionName.optional() }))
    .output(z.object({ url: z.string() })),
  setOAuthApp: base
    .route({
      method: 'PUT',
      path: '/integrations/{key}/oauth-app',
      summary: 'Set our own OAuth app',
      description:
        "The organisation's own OAuth app for this integration, kept in the vault. 409 APP_IN_USE while connections sign in through it; 403 NOT_ALLOWED where the server's app signs in",
    })
    .input(
      z.object({
        key: IntegrationKey,
        clientId: z.string().trim().min(1).max(500),
        clientSecret: z.string().trim().min(1).max(2000),
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
  removeOAuthApp: base
    .route({
      method: 'DELETE',
      path: '/integrations/{key}/oauth-app',
      summary: 'Remove our own OAuth app',
      description:
        "409 APP_IN_USE while connections sign in through it; 403 NOT_ALLOWED where the server's app signs in",
    })
    .input(z.object({ key: IntegrationKey }))
    .output(z.object({ ok: z.literal(true) })),
  list: base
    .route({
      method: 'GET',
      path: '/integrations',
      summary: 'List integrations',
      description:
        "The integrations the member may manage, core's with their form fields and those of the plugins installed here, with their state",
    })
    .output(listOf(Integration)),
  connections: base
    .route({
      method: 'GET',
      path: '/integrations/connections',
      summary: 'List connections',
      description:
        'The connections the member may manage, of one integration or of all, with their settings and what uses them but never their secrets',
    })
    .input(z.object({ key: IntegrationKey.optional() }))
    .output(listOf(VaultConnection)),
  ...connectionUseContract,
  subscriptions: base
    .route({
      method: 'GET',
      path: '/integrations/{key}/subscriptions',
      summary: 'List trigger subscriptions',
      description:
        "How the app's connections listen for automation triggers: each one's state, the triggers in use and the active automations listening",
    })
    .input(z.object({ key: IntegrationKey }))
    .output(listOf(AppSubscription)),
  records: base
    .route({
      method: 'GET',
      path: '/integrations/{key}/records/{recordType}',
      summary: 'List an app’s records',
      description:
        "The records of one type an app lists for the automation builder's pickers (the Facebook pages, a repository's workflows), read with `connection`, else the default one. `parents`: the values of the inputs the picker depends on, nearest first. A type the app doesn't list answers none. 409 NOT_CONNECTED; 400 GATEWAY_REFUSED with the service's own message",
    })
    .input(
      z.object({
        key: IntegrationKey,
        recordType: RecordType,
        connection: Id.optional(),
        parents: z.array(z.string().trim().min(1).max(500)).max(5).optional(),
        search: z.string().trim().max(200).optional(),
      }),
    )
    .output(listOf(AppRecord)),
  connect: base
    .route({
      method: 'POST',
      path: '/integrations/{key}/connections',
      successStatus: 201,
      summary: 'Add a connection',
      description:
        'Connect with these keys, checked against the service first. 400 GATEWAY_REFUSED',
    })
    .input(z.object({ key: IntegrationKey, name: ConnectionName, keys: ConnectionKeys }))
    .output(IntegrationConnection),
  update: base
    .route({
      method: 'PATCH',
      path: '/integrations/{key}/connections/{id}',
      summary: 'Change a connection',
      description:
        'Rename, turn off or on, or change the values `keys` names: a setting, or a secret typed anew. A value left out stays as kept, `null` empties an optional one, and the whole set is checked with the service first. 400 GATEWAY_REFUSED; 400 KIND_CHANGED when the connection is of another integration',
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
      summary: 'Remove a connection',
      description:
        '409 GATEWAY_IN_USE when a gateway has invoices: turn it off instead; 409 CONNECTION_IN_USE while active automations listen on it or its webhooks are still being removed',
    })
    .input(z.object({ key: IntegrationKey, id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  report: base
    .route({
      method: 'PUT',
      path: '/integrations/{key}/state',
      summary: 'Report a plugin integration’s state',
      description:
        "The calling plugin says where one of its manifest's integrations stands in this organisation (`count`: how many are connected). 404 when its manifest doesn't declare the key",
    })
    .input(ReportedState.extend({ key: IntegrationKey }))
    .output(IntegrationStatus),
};
