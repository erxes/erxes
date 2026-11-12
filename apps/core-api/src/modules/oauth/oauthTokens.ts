import { type Db, newId, oauthRefreshTokens, organizations, plugins, roles, users } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { can } from '~/http/access';
import { signJwt } from '~/lib/signing';
import { newSecret, sha256 } from './oauthClients';

const ACCESS_TTL = 3600;
const REFRESH_DAYS = 30;

interface Issued {
  orgId: string;
  userId: string;
  clientId: string;
  scope: string;
  nonce?: string | null;
  familyId?: string;
}

/** The member a token is for, with their organisation, permissions and the client's manifest. */
const memberOf = async (tx: Db, issued: Issued) => {
  const [row] = await tx
    .select({
      user: users,
      organization: organizations,
      permissions: roles.permissions,
      manifest: plugins.manifest,
    })
    .from(users)
    .innerJoin(organizations, eq(organizations.id, users.orgId))
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .innerJoin(plugins, eq(plugins.name, issued.clientId))
    .where(and(eq(users.orgId, issued.orgId), eq(users.id, issued.userId)))
    .limit(1);

  return row?.user.status === 'active' ? row : null;
};

type Member = NonNullable<Awaited<ReturnType<typeof memberOf>>>;

const accessToken = (issued: Issued, member: Member) => {
  const actor = { role: member.user.role, permissions: member.permissions };

  const permissions = (member.manifest?.permissions ?? [])
    .map((item) => item.action)
    .filter((action) => can(actor, action));

  return signJwt(
    {
      org: issued.orgId,
      scope: issued.scope,
      client_id: issued.clientId,
      role: member.user.role,
      permissions,
    },
    { typ: 'at+jwt', audience: issued.clientId, subject: issued.userId, expiresInSeconds: ACCESS_TTL },
  );
};

const idToken = (issued: Issued, member: Member, scopes: string[]) =>
  signJwt(
    {
      org: issued.orgId,
      organization: member.organization.subdomain,
      ...(scopes.includes('email') ? { email: member.user.email, email_verified: true } : {}),
      ...(scopes.includes('profile')
        ? {
            name: member.user.fullName ?? member.user.email,
            given_name: member.user.firstName ?? undefined,
            family_name: member.user.lastName ?? undefined,
            picture: member.user.avatarUrl ?? undefined,
          }
        : {}),
      ...(issued.nonce ? { nonce: issued.nonce } : {}),
    },
    { typ: 'JWT', audience: issued.clientId, subject: issued.userId, expiresInSeconds: ACCESS_TTL },
  );

/** A new refresh token in the family (a new family on sign-in). */
const refreshToken = async (tx: Db, issued: Issued, member: Member) => {
  const id = newId();
  const secret = newSecret();

  await tx.insert(oauthRefreshTokens).values({
    id,
    orgId: issued.orgId,
    clientId: issued.clientId,
    userId: issued.userId,
    familyId: issued.familyId ?? id,
    tokenHash: sha256(secret),
    scope: issued.scope,
    sessionVersion: member.user.sessionVersion,
    expiresAt: sql`now() + make_interval(days => ${REFRESH_DAYS})`,
  });

  return `${id}.${secret}`;
};

/** Access token, ID token (openid) and a refresh token (offline_access), in the member's organisation. */
export const issueTokens = async (tx: Db, issued: Issued) => {
  const member = await memberOf(tx, issued);

  if (!member) return null;

  const scopes = issued.scope.split(' ');

  return {
    access_token: await accessToken(issued, member),
    token_type: 'Bearer',
    expires_in: ACCESS_TTL,
    scope: issued.scope,
    ...(scopes.includes('openid') ? { id_token: await idToken(issued, member, scopes) } : {}),
    ...(scopes.includes('offline_access')
      ? { refresh_token: await refreshToken(tx, issued, member) }
      : {}),
  };
};
