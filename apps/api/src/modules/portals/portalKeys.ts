import {
  caller,
  type Db,
  newId,
  portalKeys,
  portalPlugins,
  portals,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, desc, eq, exists, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { sha256 } from '~/lib/crypto';
import { wholeList } from '~/lib/keyset';
import { signJwt } from '~/lib/signing';
import { newSecret, sameHash, splitCredential } from '~/modules/oauth/oauthClients';

/** Server keys start with this, so secret scanners and people can tell them apart. */
const KEY_PREFIX = 'erxp_';

const PORTAL_TOKEN_SECONDS = 900;

/** The portal's server keys, newest first. */
export const listPortalKeys = async (client: Db, portalId: string) => ({
  data: await wholeList((limit) =>
    client
      .select()
      .from(portalKeys)
      .where(eq(portalKeys.portalId, portalId))
      .orderBy(desc(portalKeys.createdAt), desc(portalKeys.id))
      .limit(limit),
  ),
});

/** A new server key for the portal; its secret is in the answer only. */
export const createPortalKey = async (client: Db, input: { id: string; name: string }) => {
  const [portal] = await client
    .select({ id: portals.id })
    .from(portals)
    .where(eq(portals.id, input.id))
    .limit(1);

  if (!portal) throw notFound('Portal');

  const id = newId();
  const secret = newSecret();
  const who = caller();

  const [row] = await client
    .insert(portalKeys)
    .values({
      id,
      portalId: portal.id,
      name: input.name,
      secretHash: sha256(secret),
      hint: secret.slice(-4),
      createdBy: who.type === 'user' ? who.userId : null,
    })
    .returning();

  if (!row) throw new Error('the key was not saved');

  return { ...row, secret: `${KEY_PREFIX}${id}.${secret}` };
};

export const removePortalKey = async (client: Db, input: { id: string; keyId: string }) => {
  const [row] = await client
    .delete(portalKeys)
    .where(and(eq(portalKeys.id, input.keyId), eq(portalKeys.portalId, input.id)))
    .returning({ id: portalKeys.id, name: portalKeys.name });

  if (!row) throw notFound('Key');

  return row;
};

const invalidKey = () => fail('INVALID_TOKEN', 'The portal key is not valid');

/**
 * A 15-minute portal token for a server key, while the key stands and its portal has a
 * plugin: `sub` the portal, `org`, `kid` the key. Plugins check it with `verifyPortalToken`.
 */
export const portalToken = async (key: string) => {
  const { id, secret } = splitCredential(
    key.startsWith(KEY_PREFIX) ? key.slice(KEY_PREFIX.length) : '',
  );

  if (!id || !secret) throw invalidKey();

  const [row] = await withSystem('portal key lookup', (tx) =>
    tx
      .select({
        orgId: portalKeys.orgId,
        portalId: portalKeys.portalId,
        hash: portalKeys.secretHash,
      })
      .from(portalKeys)
      .where(
        and(
          eq(portalKeys.id, id),
          exists(
            tx
              .select({ plugin: portalPlugins.plugin })
              .from(portalPlugins)
              .where(eq(portalPlugins.portalId, portalKeys.portalId)),
          ),
        ),
      )
      .limit(1),
  );

  if (!row || !sameHash(row.hash, secret)) throw invalidKey();

  await withOrg(row.orgId, (tx) =>
    tx
      .update(portalKeys)
      .set({ lastUsedAt: sql`now()` })
      .where(eq(portalKeys.id, id)),
  );

  return {
    accessToken: await signPortalToken(row.orgId, row.portalId, id),
    expiresIn: PORTAL_TOKEN_SECONDS,
    portalId: row.portalId,
  };
};

/** `kid` names the server key, or `agent:<id>` for core's agent acting on the portal. */
const signPortalToken = (orgId: string, portalId: string, kid: string) =>
  signJwt(
    { org: orgId, kid },
    {
      typ: 'portal+jwt',
      audience: 'erxes-portal',
      subject: portalId,
      expiresInSeconds: PORTAL_TOKEN_SECONDS,
    },
  );

/** A portal token for an agent that talks to the portal's customers. */
export const agentPortalToken = (orgId: string, portalId: string, agentId: string) =>
  signPortalToken(orgId, portalId, `agent:${agentId}`);
