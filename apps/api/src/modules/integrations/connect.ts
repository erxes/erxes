import {
  INTEGRATION_PICK_MINUTES,
  IntegrationCandidates,
  type IntegrationCandidate,
  IntegrationConnectAnswer,
  type IntegrationFormValues,
  IntegrationStartAnswer,
} from '@erxes/core-contract';
import {
  callerUserId,
  type Db,
  integrationPicks,
  newId,
  requestOrgId,
  users,
  withOrg,
} from '@erxes/core-db';
import { and, eq, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail, notFound } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { appLink } from '~/modules/email/email';
import { recordAudit } from '~/modules/audit/audit.service';
import { type AccountRow, accountsOf, assertRoomFor, saveCandidate } from './accounts.service';
import { managedDefinition, ownDefinition, type PluginDefinition, kindLabel } from './definitions';
import { askOwner, hasHook, type OwnerScope } from './owner';
import { assertForm, getSetupValues } from './setups.service';
import { openSealed, sealValues } from './vault';

interface Failure {
  name: string;
  message: string;
}

const keyOf = (item: { kind: string; externalId: string }) => `${item.kind}:${item.externalId}`;

const scopeFor = async (tx: Db, definition: PluginDefinition, userId: string | null) => ({
  orgId: requestOrgId(),
  userId,
  setup: await getSetupValues(tx, definition.ref),
});

const assertKinds = (definition: PluginDefinition, candidates: IntegrationCandidate[]) => {
  const kinds = new Set(definition.spec.accounts.map((item) => item.kind));
  const unknown = candidates.find((candidate) => !kinds.has(candidate.kind));

  if (unknown) {
    throw fail(
      'INTEGRATION_REFUSED',
      `${definition.spec.name} offered a ${unknown.kind}, which it does not declare`,
    );
  }
};

const hookAccount = (id: string, candidate: IntegrationCandidate) => ({
  id,
  kind: candidate.kind,
  externalId: candidate.externalId,
  name: candidate.name,
  detail: candidate.detail,
  config: candidate.config,
  secret: candidate.secret,
});

const announce = async (
  definition: PluginDefinition,
  scope: OwnerScope,
  id: string,
  candidate: IntegrationCandidate,
): Promise<string | null> => {
  if (!hasHook(definition, 'connected')) return null;

  const answer = await askOwner(
    definition,
    scope,
    { hook: 'connected', account: hookAccount(id, candidate) },
    z.unknown(),
  ).catch((error: unknown) => ({
    ok: false as const,
    message: error instanceof Error ? error.message : String(error),
  }));

  return answer.ok ? null : answer.message;
};

const connectCandidates = async (
  orgId: string,
  definition: PluginDefinition,
  candidates: IntegrationCandidate[],
  userId: string | null,
) => {
  const { scope, existing } = await withOrg(orgId, async (tx) => {
    const rows = await accountsOf(tx, definition.ref);
    const known = new Set(rows.map(keyOf));

    await assertRoomFor(
      tx,
      definition.ref,
      candidates.filter((candidate) => !known.has(keyOf(candidate))).length,
    );

    return {
      scope: await scopeFor(tx, definition, userId),
      existing: new Map(rows.map((row) => [keyOf(row), row.id])),
    };
  });

  const accepted: { id: string; candidate: IntegrationCandidate }[] = [];
  const failed: Failure[] = [];

  await inOrder(candidates, async (candidate) => {
    const id = existing.get(keyOf(candidate)) ?? newId();
    const refusal = await announce(definition, scope, id, candidate);

    if (refusal) failed.push({ name: candidate.name, message: refusal });
    else accepted.push({ id, candidate });
  });

  const connected: AccountRow[] = [];

  await withOrg(orgId, async (tx) => {
    await inOrder(accepted, async ({ id, candidate }) => {
      connected.push(await saveCandidate(tx, definition.ref, id, candidate, userId));
    });

    await recordAudit(
      tx,
      connected.map((account) => ({
        action: 'integration_account.connected',
        targetType: 'integration_account',
        targetId: account.id,
        targetLabel: account.name,
        metadata: {
          integration: definition.ref,
          kind: kindLabel(definition, account.kind),
          externalId: account.externalId,
        },
      })),
    );
  });

  return { connected, failed };
};

const createPick = async (
  tx: Db,
  definition: PluginDefinition,
  userId: string,
  candidates: IntegrationCandidate[],
) => {
  const id = newId();

  await tx.insert(integrationPicks).values({
    id,
    integration: definition.ref,
    userId,
    candidatesSealed: sealValues(candidates),
    expiresAt: sql`now() + make_interval(mins => ${INTEGRATION_PICK_MINUTES})`,
  });

  return id;
};

const takeCandidates = async (
  orgId: string,
  definition: PluginDefinition,
  userId: string,
  candidates: IntegrationCandidate[],
) => {
  assertKinds(definition, candidates);

  if (!candidates.length) return { pickId: null, connected: [], failed: [] };

  if (definition.spec.pick) {
    const pickId = await withOrg(orgId, (tx) => createPick(tx, definition, userId, candidates));

    return { pickId, connected: [], failed: [] };
  }

  return { pickId: null, ...(await connectCandidates(orgId, definition, candidates, userId)) };
};

const refuse = (message: string) => fail('INTEGRATION_REFUSED', message);

export const startConnect = async (ref: string) => {
  const userId = callerUserId();

  const { definition, scope } = await withOrg(requestOrgId(), async (tx) => {
    const found = await managedDefinition(tx, ref);

    return { definition: found, scope: await scopeFor(tx, found, userId) };
  });

  if (definition.spec.connect.type !== 'redirect') {
    throw fail('INVALID_TYPE', `${definition.spec.name} connects with its form`);
  }

  const answer = await askOwner(definition, scope, { hook: 'start' }, IntegrationStartAnswer);

  if (!answer.ok) throw refuse(answer.message);

  if (!/^https?:\/\//.test(answer.answer.url)) {
    throw fail('PLUGIN_UNREACHABLE', `${definition.plugin} answered no sign-in address`);
  }

  return answer.answer;
};

export const connectWithForm = async (ref: string, values: IntegrationFormValues) => {
  const orgId = requestOrgId();
  const userId = callerUserId();

  if (!userId) throw fail('MEMBERS_ONLY', 'A team member connects an account');

  const { definition, scope } = await withOrg(orgId, async (tx) => {
    const found = await managedDefinition(tx, ref);

    return { definition: found, scope: await scopeFor(tx, found, userId) };
  });

  if (definition.spec.connect.type !== 'form') {
    throw fail('INVALID_TYPE', `${definition.spec.name} connects with a sign-in`);
  }

  assertForm(definition.spec.connect.fields, values);

  const answer = await askOwner(
    definition,
    scope,
    { hook: 'connect', values },
    IntegrationConnectAnswer,
  );

  if (!answer.ok) throw refuse(answer.message);

  if (!answer.answer.candidates.length) {
    throw refuse(`${definition.spec.name} found nothing to connect with these details`);
  }

  return takeCandidates(orgId, definition, userId, answer.answer.candidates);
};

const loadPick = async (tx: Db, id: string) => {
  const [row] = await tx
    .select({
      pick: integrationPicks,
      expired: sql<boolean>`${integrationPicks.expiresAt} <= now()`,
    })
    .from(integrationPicks)
    .where(and(eq(integrationPicks.id, id), eq(integrationPicks.userId, callerUserId() ?? '')))
    .limit(1);

  if (!row) throw notFound('Pick');

  if (row.expired) {
    throw fail('PICK_EXPIRED', 'This sign-in ran out of time. Connect again.');
  }

  return {
    ...row.pick,
    definition: await managedDefinition(tx, row.pick.integration),
    candidates: openSealed(row.pick, row.pick.candidatesSealed, IntegrationCandidates),
  };
};

export const getPick = async (tx: Db, id: string) => {
  const pick = await loadPick(tx, id);
  const connected = new Set((await accountsOf(tx, pick.integration)).map(keyOf));

  return {
    id: pick.id,
    integration: pick.integration,
    expiresAt: pick.expiresAt,
    candidates: pick.candidates.map((candidate) => ({
      ...candidate,
      connected: connected.has(keyOf(candidate)),
    })),
  };
};

export const confirmPick = async (id: string, chosen: { kind: string; externalId: string }[]) => {
  const orgId = requestOrgId();
  const pick = await withOrg(orgId, (tx) => loadPick(tx, id));
  const wanted = new Set(chosen.map(keyOf));
  const candidates = pick.candidates.filter((candidate) => wanted.has(keyOf(candidate)));

  if (candidates.length !== wanted.size) {
    throw fail('INVALID_INPUT', 'Choose from what the sign-in found', {
      issues: [{ path: ['chosen'], message: 'Choose from what the sign-in found' }],
    });
  }

  const result = await connectCandidates(orgId, pick.definition, candidates, pick.userId);

  if (!result.failed.length) {
    await withOrg(orgId, (tx) => tx.delete(integrationPicks).where(eq(integrationPicks.id, id)));
  }

  return { pickId: result.failed.length ? id : null, ...result };
};

export const cancelPick = async (tx: Db, id: string) => {
  await tx
    .delete(integrationPicks)
    .where(and(eq(integrationPicks.id, id), eq(integrationPicks.userId, callerUserId() ?? '')));

  return { ok: true as const };
};

export const pruneIntegrationPicks = (tx: Db) =>
  tx.delete(integrationPicks).where(lt(integrationPicks.expiresAt, sql`now()`));

const integrationPath = (ref: string) => `/settings/integrations/${ref}`;

export const offerCandidates = async (input: {
  integration: string;
  userId: string;
  candidates: IntegrationCandidate[];
}) => {
  const orgId = requestOrgId();

  const { definition, base } = await withOrg(orgId, async (tx) => {
    const [member] = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, input.userId), eq(users.status, 'active')))
      .limit(1);

    if (!member) throw notFound('Member');

    return {
      definition: await ownDefinition(tx, input.integration),
      base: await appLink(tx, ''),
    };
  });

  const taken = await takeCandidates(orgId, definition, input.userId, input.candidates);
  const page = `${base}${integrationPath(definition.ref)}`;

  return {
    url: taken.pickId
      ? `${page}?pick=${taken.pickId}`
      : `${page}?connected=${taken.connected.length}&failed=${taken.failed.length}`,
    pickId: taken.pickId,
    connected: taken.connected.length,
    failed: taken.failed.length,
  };
};
