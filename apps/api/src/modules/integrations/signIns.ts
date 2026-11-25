import { type Db, integrationConnections, newId } from '@erxes/core-db';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { lockKeys } from '~/lib/locks';
import type { OAuthKeys } from '@erxes/plugin-sdk/integrations';
import { recordAudit } from '~/modules/audit/audit.service';
import { sealValues } from './connections';
import { connectionChanged, connectionOf, insertConnection } from './integrations.service';
import type { KeyedIntegration } from './define';
import { sameOwner } from './connectionNames';
import { ownerFor } from './scopes';
import type { IntegrationScope } from '@erxes/core-contract';

type SignedIn = OAuthKeys & { account: string; accountId: string };

const accountSetting = (name: string) => sql`${integrationConnections.settings} ->> ${name}`;

/**
 * The account's connection. One made before connections kept the account's id is matched by
 * the account's name.
 */
const connectionOfAccount = async (tx: Db, key: string, ownerId: string | null, keys: SignedIn) => {
  const [row] = await tx
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .where(
      and(
        eq(integrationConnections.key, key),
        sameOwner(ownerId),
        or(
          eq(accountSetting('accountId'), keys.accountId),
          and(isNull(accountSetting('accountId')), eq(accountSetting('account'), keys.account)),
        ),
      ),
    )
    .orderBy(integrationConnections.createdAt)
    .limit(1);

  return row ?? null;
};

/** The account signed in again: its connection takes the new sign-in, and keeps its name. */
const renewSignIn = async (tx: Db, integration: KeyedIntegration, id: string, keys: SignedIn) => {
  const before = await connectionOf(tx, integration, id);

  const [row] = await tx
    .update(integrationConnections)
    .set({
      ...(await sealValues(tx, integration, keys, before.secretId)),
      updatedAt: sql`now()`,
    })
    .where(eq(integrationConnections.id, id))
    .returning();

  if (!row) throw new Error(`Connection ${id} went away while signing in again`);

  await recordAudit(tx, {
    action: 'integration.updated',
    targetType: 'integration_connection',
    targetId: row.id,
    targetLabel: row.name,
    metadata: { key: row.key, credentialsChanged: true, ...row.settings },
  });
  await connectionChanged(tx, { key: row.key, connectionId: row.id, change: row.status });

  return row;
};

/** `name`, or "name 2" and on while another of the integration's connections has it. */
const freeName = async (tx: Db, key: string, ownerId: string | null, name: string) => {
  const taken = new Set(
    (
      await tx
        .select({ name: integrationConnections.name })
        .from(integrationConnections)
        .where(and(eq(integrationConnections.key, key), sameOwner(ownerId)))
    ).map((row) => row.name.toLowerCase()),
  );

  let free = name;

  for (let count = 2; taken.has(free.toLowerCase()); count++) free = `${name} ${count}`;

  return free;
};

/**
 * Saves a sign-in: one connection per account. Signing in again with an account renews its
 * connection's sign-in and keeps its name; a new account's connection is `name`, or the account's.
 */
export const saveSignIn = async (
  tx: Db,
  integration: KeyedIntegration,
  input: { orgId: string; name?: string; scope: IntegrationScope; keys: SignedIn },
) => {
  const ownerId = ownerFor(integration, input.scope);

  await lockKeys(tx, [
    `integration-account:${input.orgId}:${integration.key}:${ownerId ?? ''}:${input.keys.accountId}`,
  ]);

  const known = await connectionOfAccount(tx, integration.key, ownerId, input.keys);

  if (known) return renewSignIn(tx, integration, known.id, input.keys);

  return insertConnection(tx, integration, {
    id: newId(),
    name: await freeName(tx, integration.key, ownerId, input.name ?? input.keys.account),
    ownerId,
    keys: input.keys,
  });
};
