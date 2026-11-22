import { VAULT_HOLDERS } from '@erxes/core-db/enums';
import { integrationConnections } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS } from './errors';
import { ConnectionName } from './integrations';
import { IntegrationKey } from './values';

export const SecretValue = z.string().min(1).max(65_536);

const Problem = z.string().trim().min(1).max(200);

export const PluginSecret = createSelectSchema(integrationConnections, {
  id: Id,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  key: true,
  name: true,
  status: true,
  problem: true,
  createdAt: true,
  updatedAt: true,
});

export type PluginSecret = z.infer<typeof PluginSecret>;

export const VaultHolding = z.object({
  holder: z.enum(VAULT_HOLDERS),
  count: z.int(),
});

export type VaultHolding = z.infer<typeof VaultHolding>;

const base = oc.errors(COMMON_ERRORS);

export const secretsContract = {
  holdings: base
    .route({
      method: 'GET',
      path: '/secrets/holdings',
      summary:
        "How many secrets the vault keeps for each of core's features, besides integration connections. Never a value",
    })
    .output(listOf(VaultHolding)),
  save: base
    .route({
      method: 'POST',
      path: '/secrets',
      successStatus: 201,
      summary:
        "Seal a password, token or key as a named connection of one of the calling plugin's integrations (`key`, from its manifest), shown in Settings › Vault and on the integration's card. 404 when the manifest doesn't declare the key",
    })
    .input(z.object({ key: IntegrationKey, name: ConnectionName, value: SecretValue }))
    .output(PluginSecret),
  list: base
    .route({
      method: 'GET',
      path: '/secrets',
      summary: 'The connections the calling plugin saved here, of one integration or of all',
    })
    .input(z.object({ key: IntegrationKey.optional() }))
    .output(listOf(PluginSecret)),
  read: base
    .route({
      method: 'GET',
      path: '/secrets/{id}',
      summary: 'The value of a connection the calling plugin saved. 404 for any other',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ value: SecretValue })),
  replace: base
    .route({
      method: 'PATCH',
      path: '/secrets/{id}',
      summary:
        'Rename a connection the calling plugin saved, or replace its value: a new value clears its problem. The id stays',
    })
    .input(z.object({ id: Id, name: ConnectionName.optional(), value: SecretValue.optional() }))
    .output(PluginSecret),
  mark: base
    .route({
      method: 'PUT',
      path: '/secrets/{id}/problem',
      summary:
        'Say what is wrong with a connection ("Page token expired"): its card shows Needs attention with it. null: fixed',
    })
    .input(z.object({ id: Id, problem: Problem.nullable() }))
    .output(PluginSecret),
  remove: base
    .route({
      method: 'DELETE',
      path: '/secrets/{id}',
      summary: 'Delete a connection the calling plugin saved, and its value',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
