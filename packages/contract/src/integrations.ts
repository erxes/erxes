import { GATEWAY_REFUND_KINDS } from '@erxes/core-db/enums';
import {
  APP_TRIGGER_DELIVERIES,
  INTEGRATION_CONNECTION_STATUSES,
  INTEGRATION_FIELD_TYPES,
  INTEGRATION_STATES,
} from '@erxes/core-db/integrationEnums';
import { integrationConnections } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationCategory } from './values';

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

export const IntegrationStatus = z.object({
  state: z.enum(INTEGRATION_STATES),
  count: z.int().nullable(),
});

export type IntegrationStatus = z.infer<typeof IntegrationStatus>;

export const IntegrationPayments = z.object({
  currencies: z.array(z.string()),
  refunds: z.enum(GATEWAY_REFUND_KINDS),
  pays: z.string(),
});

export const Integration = z.object({
  key: z.string(),
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
});

export type Integration = z.infer<typeof Integration>;

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
  connections: z.array(IntegrationConnection.pick({ id: true, name: true, status: true })),
});

export type AutomationApp = z.infer<typeof AutomationApp>;

export const appEventType = (app: string, trigger: string) =>
  `app.${app.replaceAll('-', '_')}.${trigger}`;

const IntegrationKey = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);

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
      summary: 'The integrations the member may manage, with their form fields and state',
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
};
