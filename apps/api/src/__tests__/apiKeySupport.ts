import { apiKeys, newId } from '@erxes/core-db';
import { randomToken, sha256 } from '~/lib/crypto';
import { adminDb } from './db';
import type { CoreClient } from './support';

type KeyRules = Omit<Parameters<CoreClient['apiKeys']['create']>[0], 'name' | 'lifetimeDays'>;

/** A key as keys were before rules (what the migration leaves): it acts as its member. */
export const memberKey = async (orgId: string, userId: string) => {
  const id = newId();
  const secret = randomToken(32);

  await adminDb()
    .insert(apiKeys)
    .values({ id, orgId, userId, name: 'Old key', secretHash: sha256(secret) });

  return { id, key: `erxes_${id}.${secret}` };
};

/** "Try this key" for one call: the decision among every call's. */
export const tryCall = async (
  client: CoreClient,
  input: { id: string; recordId?: string; ip?: string },
  procedure: string,
) => (await client.apiKeys.try(input)).data.find((decision) => decision.procedure === procedure);

/** A regular key that reads contacts, with no limits. */
export const READ_CONTACTS: KeyRules = {
  kind: 'regular',
  areas: { contacts: 'read' },
  ownRecords: false,
  unitIds: [],
  tagIds: [],
  allowedIps: [],
};

/** A management key for the team, keys and (reading) settings. */
export const SETUP: KeyRules = {
  kind: 'management',
  areas: { team: 'write', settings: 'read', keys: 'write' },
  ownRecords: false,
  unitIds: [],
  tagIds: [],
  allowedIps: [],
};
