import { VAULT_HOLDERS } from '@erxes/core-db/integrationEnums';
import { secrets } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, listOf } from './common';
import { COMMON_ERRORS } from './errors';

export const SecretValue = z.string().min(1).max(65_536);

export const SecretRef = createSelectSchema(secrets, { id: Id }).pick({ id: true });

export type SecretRef = z.infer<typeof SecretRef>;

export const VaultHolding = z.object({
  holder: z.enum(VAULT_HOLDERS),
  plugin: z.string().nullable(),
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
        'How many secrets the vault keeps for each feature and plugin, besides integration connections. Never a value',
    })
    .output(listOf(VaultHolding)),
  save: base
    .route({
      method: 'POST',
      path: '/secrets',
      successStatus: 201,
      summary:
        'Seal a password, token or key in the vault and get its id (plugins with secrets:write). The plugin stores only the id',
    })
    .input(z.object({ value: SecretValue }))
    .output(SecretRef),
  replace: base
    .route({
      method: 'PUT',
      path: '/secrets/{id}',
      summary: "Replace a secret's value; the id stays. 404 when the plugin did not save it",
    })
    .input(z.object({ id: Id, value: SecretValue }))
    .output(SecretRef),
  read: base
    .route({
      method: 'GET',
      path: '/secrets/{id}',
      summary: 'The value of a secret the calling plugin saved. 404 for any other',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ value: SecretValue })),
  remove: base
    .route({
      method: 'DELETE',
      path: '/secrets/{id}',
      summary: 'Delete a secret the calling plugin saved',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
