import { apiKeys, caller, type Db, newId, users, withSystem } from '@erxes/core-db';
import { and, count, desc, eq, getTableColumns, gt, isNull, lt, or, sql } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';

/** Keys read `erxes_<id>.<secret>`: the prefix tells them from session and plugin tokens. */
const KEY_PREFIX = 'erxes_';

/** Keys a member may hold at once. */
const MAX_KEYS = 20;

/** Is the bearer token an API key (not a session or plugin token)? */
export const isApiKey = (token: string) => token.startsWith(KEY_PREFIX);

/** The signed-in member; a request made with an API key can't manage keys. */
const sessionMember = () => {
  const who = caller('user');

  if (who.apiKeyId) {
    throw fail('SESSION_REQUIRED', "Sign in to manage API keys; an API key can't");
  }

  return who;
};

/** May the caller see and revoke other members' keys? */
const managesEveryKey = () => callerCan('api_keys.manage');

const withMember = (client: Db) =>
  client
    .select({ ...getTableColumns(apiKeys), memberName: users.fullName, memberEmail: users.email })
    .from(apiKeys)
    .innerJoin(users, eq(users.id, apiKeys.userId));

export const listApiKeys = async (client: Db) => {
  const { userId } = sessionMember();
  const own = managesEveryKey() ? undefined : eq(apiKeys.userId, userId);

  return {
    data: await wholeList((limit) =>
      withMember(client).where(own).orderBy(desc(apiKeys.createdAt)).limit(limit),
    ),
  };
};

export const createApiKey = async (
  client: Db,
  input: { name: string; lifetimeDays: number | null },
) => {
  const { userId } = sessionMember();

  const [held] = await client
    .select({ total: count() })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));

  if ((held?.total ?? 0) >= MAX_KEYS) {
    throw fail('LIMIT_EXCEEDED', `You can hold ${MAX_KEYS} API keys; revoke one first`);
  }

  const id = newId();
  const secret = randomToken(32);

  await client.insert(apiKeys).values({
    id,
    userId,
    name: input.name,
    secretHash: sha256(secret),
    expiresAt:
      input.lifetimeDays === null
        ? null
        : sql`now() + make_interval(days => ${input.lifetimeDays})`,
  });

  const apiKey = oneRow(await withMember(client).where(eq(apiKeys.id, id)).limit(1));

  await recordAudit(client, {
    action: 'api_key.created',
    targetType: 'api_key',
    targetId: id,
    targetLabel: input.name,
    metadata: { expiresAt: apiKey.expiresAt?.toISOString() ?? null },
  });

  return { apiKey, key: `${KEY_PREFIX}${id}.${secret}` };
};

/** Revokes a key: the member's own, or anyone's with `api_keys.manage` (others' are 404). */
export const removeApiKey = async (client: Db, id: string) => {
  const { userId } = sessionMember();

  const [row] = await client.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);

  if (!row || (row.userId !== userId && !managesEveryKey())) throw notFound('API key');

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
 * The member and organisation an API key acts for, or null when it is unknown,
 * expired or revoked. The id says where to look (the one lookup before the
 * organisation is known); the secret must match its hash. Marks the key used,
 * at most once a minute.
 */
export const apiKeyOwner = async (token: string) => {
  const [id, secret] = token.slice(KEY_PREFIX.length).split('.');

  if (!id || !secret) return null;

  return withSystem('api key lookup', async (tx) => {
    const [row] = await tx
      .select({
        id: apiKeys.id,
        orgId: apiKeys.orgId,
        userId: apiKeys.userId,
        secretHash: apiKeys.secretHash,
      })
      .from(apiKeys)
      .where(
        and(eq(apiKeys.id, id), or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, sql`now()`))),
      )
      .limit(1);

    if (!row || !safeEqual(row.secretHash, sha256(secret))) return null;

    await tx
      .update(apiKeys)
      .set({ lastUsedAt: sql`now()` })
      .where(
        and(
          eq(apiKeys.id, id),
          or(isNull(apiKeys.lastUsedAt), lt(apiKeys.lastUsedAt, sql`now() - interval '1 minute'`)),
        ),
      );

    return { apiKeyId: row.id, orgId: row.orgId, userId: row.userId };
  });
};
