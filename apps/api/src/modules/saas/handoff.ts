import { organizations, runAs, usedTokens, users, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, ne, sql } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { sha256 } from '~/lib/crypto';
import { fail } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { asMember } from '~/modules/auth/account.service';
import { subdomainFromHost } from '~/modules/auth/auth.service';

/** erxes.io's claims; a claim of the wrong type makes it not a sign-in link. */
const HandoffClaims = z.object({
  user: z.object({ email: z.string().optional() }).optional(),
  email: z.string().optional(),
  org: z.string().optional(),
  exp: z.number().optional(),
});

/** The organisation: the token's `org`, else the address's subdomain. */
const handoffOrganization = async (org: string | undefined, host: string | undefined) => {
  const subdomain = subdomainFromHost(host) ?? config.auth.defaultSubdomain;

  const [found] = await withSystem('saas: hand-off organisation', (tx) =>
    tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        org
          ? eq(organizations.id, org)
          : eq(sql`lower(${organizations.subdomain})`, (subdomain ?? '').toLowerCase()),
      )
      .limit(1),
  );

  if (!found) throw fail('NOT_FOUND', 'No such workspace');

  return found.id;
};

/** erxes.io's tokens carry no id: the token itself (hashed) is what can't be used twice. */
const useOnce = async (token: string, exp: number) => {
  const used = await withSystem('saas: hand-off', (tx) =>
    tx
      .insert(usedTokens)
      .values({
        jti: `saas:${sha256(token, 'base64url')}`,
        expiresAt: new Date(exp * 1000),
      })
      .onConflictDoNothing()
      .returning({ jti: usedTokens.jti }),
  );

  if (!used.length) throw fail('TOKEN_USED', 'This sign-in link was already used');
};

/**
 * erxes.io's "open workspace" link: `…/core-login?token=` with an HS256
 * token signed with SAAS_JWT_TOKEN_SECRET (erxes.io's `workspaceUrl`):
 * `{ user: { email } }` (or `email`), at most 5 minutes old. The
 * organisation is the token's `org`, else the address's subdomain. Each
 * token works once.
 */
export const redeemHandoff = async (token: string, host: string | undefined) => {
  if (!config.saas.handoffSecret) throw fail('NOT_FOUND', 'Sign-in hand-off is not set up');

  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.saas.handoffSecret), {
    algorithms: ['HS256'],
    maxTokenAge: '5m',
  });

  const { data: claims } = HandoffClaims.safeParse(payload);
  const email = claims?.user?.email ?? claims?.email;

  if (!claims || !email || !claims.exp) throw fail('INVALID_TOKEN', 'Not a sign-in link');

  const orgId = await handoffOrganization(claims.org, host);

  await useOnce(token, claims.exp);

  const [user] = await withOrg(orgId, (tx) =>
    tx
      .select({ id: users.id, role: users.role, status: users.status })
      .from(users)
      .where(and(eq(sql`lower(${users.email})`, email.toLowerCase()), ne(users.status, 'disabled')))
      .limit(1),
  );

  if (!user) throw fail('NOT_A_MEMBER', 'You are not a member of this workspace');

  await withOrg(orgId, async (tx) => {
    // erxes.io vouches for the email: an invited member becomes active.
    if (user.status === 'invited')
      await tx
        .update(users)
        .set({ status: 'active', updatedAt: sql`now()` })
        .where(eq(users.id, user.id));

    await runAs(asMember(user), () =>
      recordAudit(tx, {
        action: 'auth.signed_in',
        targetType: 'user',
        targetId: user.id,
        targetLabel: email,
        metadata: { method: 'erxes_io' },
      }),
    );
  });

  return { orgId, userId: user.id };
};
