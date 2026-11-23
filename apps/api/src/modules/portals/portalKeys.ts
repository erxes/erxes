import type { PortalKeyKind } from '@erxes/core-contract';
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
import { and, desc, eq, exists, getTableColumns, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { sha256 } from '~/lib/crypto';
import { wholeList } from '~/lib/keyset';
import { signJwt } from '~/lib/signing';
import { portalFor } from '~/modules/customerAuth/customerPortals';
import { newSecret, sameHash, splitCredential } from '~/modules/oauth/oauthClients';

/**
 * Customer keys start with their kind's prefix, so secret scanners and people can tell them
 * apart: `erxp_` a secret key, `erxpk_` a publishable one.
 */
const KEY_PREFIXES = { secret: 'erxp_', publishable: 'erxpk_' } as const satisfies Record<
  PortalKeyKind,
  string
>;

/** A key's id and secret, with no prefix or another kind's. */
const keyParts = (key: string) => {
  const prefix = Object.values(KEY_PREFIXES)
    .toSorted((a, b) => b.length - a.length)
    .find((candidate) => key.startsWith(candidate));

  return prefix ? splitCredential(key.slice(prefix.length)) : { id: null, secret: null };
};

const PORTAL_TOKEN_SECONDS = 900;

/** Every portal's customer keys with the portal's name, newest first. */
export const listPortalKeys = async (client: Db) => ({
  data: await wholeList((limit) =>
    client
      .select({ ...getTableColumns(portalKeys), portalName: portals.name })
      .from(portalKeys)
      .innerJoin(portals, eq(portals.id, portalKeys.portalId))
      .orderBy(desc(portalKeys.createdAt), desc(portalKeys.id))
      .limit(limit),
  ),
});

/**
 * A new customer key for the portal. A secret key's secret is in the answer only; a publishable
 * key is kept whole, since its apps ship it to everyone.
 */
export const createPortalKey = async (
  client: Db,
  input: { id: string; name: string; kind: PortalKeyKind },
) => {
  const [portal] = await client
    .select({ id: portals.id })
    .from(portals)
    .where(eq(portals.id, input.id))
    .limit(1);

  if (!portal) throw notFound('Portal');

  const id = newId();
  const secret = newSecret();
  const key = `${KEY_PREFIXES[input.kind]}${id}.${secret}`;
  const who = caller();

  const [row] = await client
    .insert(portalKeys)
    .values({
      id,
      portalId: portal.id,
      name: input.name,
      kind: input.kind,
      secretHash: sha256(secret),
      key: input.kind === 'publishable' ? key : null,
      hint: secret.slice(-4),
      createdBy: who.type === 'user' ? who.userId : null,
    })
    .returning();

  if (!row) throw new Error('the key was not saved');

  return { ...row, secret: key };
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

const secretInBrowser = () =>
  fail(
    'ORIGIN_NOT_ALLOWED',
    'A secret customer key works from a server only: give web and mobile apps a publishable key',
  );

/**
 * A 15-minute portal token for a customer key, while the key stands and its portal has a
 * plugin: `sub` the portal, `org`, `kid` the key, `knd` its kind, and `ori` the web address a
 * browser traded a publishable key from. A browser (it sends `Origin`) may trade only a
 * publishable key, from one of the portal's web addresses. Plugins check the token with
 * `verifyPortalToken`.
 */
export const portalToken = async (key: string, origin: string | undefined) => {
  const { id, secret } = keyParts(key);

  if (!id || !secret) throw invalidKey();

  const [row] = await withSystem('portal key lookup', (tx) =>
    tx
      .select({
        orgId: portalKeys.orgId,
        portalId: portalKeys.portalId,
        kind: portalKeys.kind,
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

  if (!row || !key.startsWith(KEY_PREFIXES[row.kind])) throw invalidKey();

  if (!sameHash(row.hash, secret)) throw invalidKey();

  const { kind } = row;

  if (origin && kind === 'secret') throw secretInBrowser();

  // A browser's web address must be the portal's (and the portal must still sign customers in).
  if (origin) await portalFor(row.portalId, origin);

  await withOrg(row.orgId, (tx) =>
    tx
      .update(portalKeys)
      .set({ lastUsedAt: sql`now()` })
      .where(eq(portalKeys.id, id)),
  );

  return {
    accessToken: await signPortalToken(row.orgId, row.portalId, {
      kid: id,
      knd: kind,
      ...(origin && { ori: origin.toLowerCase() }),
    }),
    expiresIn: PORTAL_TOKEN_SECONDS,
    portalId: row.portalId,
  };
};

/**
 * `kid` names the customer key, or `agent:<id>` for core's agent acting on the portal; `knd`
 * is `secret`, `publishable` or `agent`.
 */
const signPortalToken = (
  orgId: string,
  portalId: string,
  claims: { kid: string; knd: PortalKeyKind | 'agent'; ori?: string },
) =>
  signJwt(
    { org: orgId, ...claims },
    {
      typ: 'portal+jwt',
      audience: 'erxes-portal',
      subject: portalId,
      expiresInSeconds: PORTAL_TOKEN_SECONDS,
    },
  );

/** A portal token for an agent that talks to the portal's customers. */
export const agentPortalToken = (orgId: string, portalId: string, agentId: string) =>
  signPortalToken(orgId, portalId, { kid: `agent:${agentId}`, knd: 'agent' });
