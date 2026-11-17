import { apiKeys, caller, type Db, newId, users, withOrg, withSystem } from '@erxes/core-db';
import { and, count, desc, eq, getTableColumns, isNull, lt, or, sql } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { type KeyRulesInput, keyRuleColumns } from './keyRulesInput';

/** Keys read `erxes_<id>.<secret>`: the prefix tells them from session and plugin tokens. */
const KEY_PREFIX = 'erxes_';

/** Keys a member may hold at once. */
const MAX_KEYS = 20;

/** Is the bearer token an API key (not a session or plugin token)? */
export const isApiKey = (token: string) => token.startsWith(KEY_PREFIX);

const sessionRequired = () =>
  fail('SESSION_REQUIRED', "Sign in to manage API keys; an API key can't");

/** The signed-in member; keys are made, changed and tried from a session only. */
export const sessionMember = () => {
  const who = caller('user');

  if (who.apiKeyId) throw sessionRequired();

  return who;
};

/**
 * Who lists and revokes keys: a signed-in member, or a management key that opens API keys
 * (its rules already said so). A member key can't.
 */
const keyManager = () => {
  const who = caller('user');

  if (who.apiKeyId && !who.key) throw sessionRequired();

  return who;
};

/** May the caller see and revoke other members' keys? */
const managesEveryKey = () => callerCan('api_keys.manage');

const withMember = (client: Db) =>
  client
    .select({ ...getTableColumns(apiKeys), memberName: users.fullName, memberEmail: users.email })
    .from(apiKeys)
    .innerJoin(users, eq(users.id, apiKeys.userId));

/** A key the caller may see (their own, or any with api_keys.manage), or 404. */
export const visibleKey = async (client: Db, id: string, userId: string) => {
  const [row] = await withMember(client).where(eq(apiKeys.id, id)).limit(1);

  if (!row || (row.userId !== userId && !managesEveryKey())) throw notFound('API key');

  return row;
};

export const listApiKeys = async (client: Db) => {
  const { userId } = keyManager();
  const own = managesEveryKey() ? undefined : eq(apiKeys.userId, userId);

  return {
    data: await wholeList((limit) =>
      withMember(client).where(own).orderBy(desc(apiKeys.createdAt)).limit(limit),
    ),
  };
};

const expiry = (lifetimeDays: number | null) =>
  lifetimeDays === null ? null : sql`now() + make_interval(days => ${lifetimeDays})`;

const mustExpire = (kind: KeyRulesInput['kind'], lifetimeDays: number | null | undefined) => {
  if (kind === 'management' && lifetimeDays === null) {
    const message = 'A management key must expire';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['lifetimeDays'], message }] });
  }
};

/** The rules as the key keeps them, for the audit log. */
const auditRules = ({ permissions: _held, ...rules }: Awaited<ReturnType<typeof keyRuleColumns>>) =>
  rules;

export const createApiKey = async (
  client: Db,
  input: KeyRulesInput & { name: string; lifetimeDays: number | null },
) => {
  const me = sessionMember();

  mustExpire(input.kind, input.lifetimeDays);

  const rules = await keyRuleColumns(client, me, input);

  const [held] = await client
    .select({ total: count() })
    .from(apiKeys)
    .where(eq(apiKeys.userId, me.userId));

  if ((held?.total ?? 0) >= MAX_KEYS) {
    throw fail('LIMIT_EXCEEDED', `You can hold ${MAX_KEYS} API keys; revoke one first`);
  }

  const id = newId();
  const secret = randomToken(32);

  await client.insert(apiKeys).values({
    id,
    userId: me.userId,
    name: input.name,
    secretHash: sha256(secret),
    ...rules,
    expiresAt: expiry(input.lifetimeDays),
  });

  const apiKey = oneRow(await withMember(client).where(eq(apiKeys.id, id)).limit(1));

  await recordAudit(client, {
    action: 'api_key.created',
    targetType: 'api_key',
    targetId: id,
    targetLabel: input.name,
    metadata: { ...auditRules(rules), expiresAt: apiKey.expiresAt?.toISOString() ?? null },
  });

  return { apiKey, key: `${KEY_PREFIX}${id}.${secret}` };
};

/**
 * Changes a key its maker made: name and rules, with the maker's role and permissions as
 * they are now. A member key takes rules here and stops acting as its member.
 */
export const updateApiKey = async (
  client: Db,
  id: string,
  input: KeyRulesInput & { name: string; lifetimeDays?: number | null },
) => {
  const me = sessionMember();
  const [row] = await client.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);

  if (!row || row.userId !== me.userId) throw notFound('API key');

  const keepsExpiry = input.lifetimeDays === undefined;

  mustExpire(input.kind, keepsExpiry && !row.expiresAt ? null : input.lifetimeDays);

  const rules = await keyRuleColumns(client, me, input);

  await client
    .update(apiKeys)
    .set({
      name: input.name,
      ...rules,
      expiresAt: keepsExpiry ? row.expiresAt : expiry(input.lifetimeDays ?? null),
      updatedAt: sql`now()`,
    })
    .where(eq(apiKeys.id, id));

  await recordAudit(client, {
    action: 'api_key.updated',
    targetType: 'api_key',
    targetId: id,
    targetLabel: input.name,
    metadata: { ...auditRules(rules), was: row.kind },
  });

  return oneRow(await withMember(client).where(eq(apiKeys.id, id)).limit(1));
};

/** Revokes a key: the caller's own, or anyone's with `api_keys.manage` (others' are 404). */
export const removeApiKey = async (client: Db, id: string) => {
  const { userId } = keyManager();
  const row = await visibleKey(client, id, userId);

  await client.delete(apiKeys).where(eq(apiKeys.id, id));

  await recordAudit(client, {
    action: 'api_key.revoked',
    targetType: 'api_key',
    targetId: id,
    targetLabel: row.name,
    metadata: { userId: row.userId },
  });

  return { ok: true as const };
};

/**
 * The key a bearer token names, or null when it is unknown or revoked or the secret doesn't
 * match its hash. The id says where to look (the one lookup before the organisation is
 * known). Expiry and the key's other rules are the caller's to check.
 */
export const apiKeyOfToken = async (token: string) => {
  const [id, secret] = token.slice(KEY_PREFIX.length).split('.');

  if (!id || !secret) return null;

  const [row] = await withSystem('api key lookup', (tx) =>
    tx.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1),
  );

  return row && safeEqual(row.secretHash, sha256(secret)) ? row : null;
};

/** Marks the key used, at most once a minute. */
export const markKeyUsed = (orgId: string, id: string) =>
  withOrg(orgId, (tx) =>
    tx
      .update(apiKeys)
      .set({ lastUsedAt: sql`now()` })
      .where(
        and(
          eq(apiKeys.id, id),
          or(isNull(apiKeys.lastUsedAt), lt(apiKeys.lastUsedAt, sql`now() - interval '1 minute'`)),
        ),
      ),
  );
