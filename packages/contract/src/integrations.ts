import {
  GATEWAY_REFUND_KINDS,
  INTEGRATION_CONNECTION_STATUSES,
  INTEGRATION_FIELD_TYPES,
  INTEGRATION_STATES,
} from '@erxes/core-db/enums';
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

export const IntegrationField = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(INTEGRATION_FIELD_TYPES),
  optional: z.boolean(),
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
  fields: z.array(IntegrationField),
  payments: IntegrationPayments.nullable(),
  status: IntegrationStatus,
});

export type Integration = z.infer<typeof Integration>;

const IntegrationKey = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);

const ConnectionName = z.string().trim().min(1).max(80);

const ConnectionKeys = z.record(z.string(), z.unknown());

const { GATEWAY_IN_USE, GATEWAY_REFUSED, KIND_CHANGED } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, GATEWAY_IN_USE, GATEWAY_REFUSED, KIND_CHANGED });

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
      path: '/integrations/{key}/connections',
      summary: "An integration's connections, with their settings but never their secrets",
    })
    .input(z.object({ key: IntegrationKey }))
    .output(listOf(IntegrationConnection)),
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
