import { SUPPORT_VISIT_HOURS } from '@erxes/core-contract';
import {
  type Db,
  newId,
  organizations,
  runAs,
  supportVisits,
  usedTokens,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, isNotNull, or, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
import { config } from '~/config';
import { startSession } from '~/http/session';
import { lockOrganization } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { subdomainFromHost } from '~/modules/auth/auth.service';
import { visitInProgress } from './onVisit';
import { supportAccessSettings, supportAvailable } from './visits';

/** erxes.io signs a link that lives a minute; core refuses one made to last longer. */
const TOKEN_SECONDS = 60;

/** What erxes.io vouches for: which of its admins, and why they are coming in. */
const SupportClaims = z.object({
  typ: z.literal('support_login'),
  sub: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  jti: z.string().min(1).max(128),
  iat: z.number(),
  exp: z.number(),
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  reason: z.string().trim().min(1).max(200),
});

type SupportClaims = z.infer<typeof SupportClaims>;

/**
 * The admin a link names, for the workspace at `subdomain`; null for a forged, foreign, stale
 * or spent one. ES256 only, by erxes.io's `kid`, so neither `none` nor an HS256 token signed
 * with a public key verifies.
 */
const verifySupportLink = async (token: string, subdomain: string) => {
  const { payload } = await jwtVerify(
    token,
    createLocalJWKSet({ keys: [...config.saas.supportKeys] }),
    {
      algorithms: ['ES256'],
      issuer: 'erxes-saas',
      audience: subdomain,
      maxTokenAge: TOKEN_SECONDS,
      clockTolerance: 10,
    },
  );

  const claims = SupportClaims.parse(payload);

  if (claims.exp - claims.iat > TOKEN_SECONDS) return null;

  // One visit per link: a URL left in a log or a browser's history is already spent.
  const used = await withSystem('support: link', (tx) =>
    tx
      .insert(usedTokens)
      .values({ jti: `support:${claims.jti}`, expiresAt: new Date(claims.exp * 1000) })
      .onConflictDoNothing()
      .returning({ jti: usedTokens.jti }),
  );

  return used.length ? claims : null;
};

/** Tagged so it never meets the admin's own account on the team. */
const supportEmail = (email: string) => email.replace(/@/, '+erxes-support@');

/** The admin's support member in the organisation, made on their first visit. */
const supportMember = async (tx: Db, staff: SupportClaims) => {
  const profile = {
    email: supportEmail(staff.email),
    fullName: `${staff.name} (erxes support)`,
  };

  // By the admin's id; an admin erxes.io made again under the same email keeps their member.
  const [known] = await tx
    .select({ userId: users.id })
    .from(users)
    .leftJoin(
      supportVisits,
      and(eq(supportVisits.userId, users.id), eq(supportVisits.staffId, staff.sub)),
    )
    .where(
      and(
        eq(users.isSupport, true),
        or(
          isNotNull(supportVisits.id),
          eq(sql`lower(${users.email})`, profile.email.toLowerCase()),
        ),
      ),
    )
    .orderBy(sql`${supportVisits.startedAt} desc nulls last`)
    .limit(1);

  if (!known) {
    return oneRow(
      await tx
        .insert(users)
        .values({
          id: newId(),
          ...profile,
          role: 'owner',
          status: 'active',
          isSupport: true,
          // Straight to work: the welcome steps (password, profile) are the team's.
          onboardedAt: sql`now()`,
        })
        .returning({ id: users.id, sessionVersion: users.sessionVersion }),
    );
  }

  // Cookies from an earlier visit stop working, and no password lets them in.
  return oneRow(
    await tx
      .update(users)
      .set({
        ...profile,
        role: 'owner',
        status: 'active',
        passwordHash: null,
        onboardedAt: sql`coalesce(${users.onboardedAt}, now())`,
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: sql`now()`,
      })
      .where(and(eq(users.id, known.userId), eq(users.isSupport, true)))
      .returning({ id: users.id, sessionVersion: users.sessionVersion }),
  );
};

/** Opens a visit, or null when the owners turned support access off. */
const enter = (orgId: string, staff: SupportClaims) =>
  withOrg(orgId, async (tx) => {
    // First, so two first visits make one member and an owner turning support off wins.
    await lockOrganization(tx);

    if (!(await supportAccessSettings(tx)).enabled) return null;

    const member = await supportMember(tx, staff);

    // One visit per admin: the new one replaces any still in progress.
    await tx
      .update(supportVisits)
      .set({ endedAt: sql`now()` })
      .where(and(eq(supportVisits.staffId, staff.sub), visitInProgress));

    const visit = oneRow(
      await tx
        .insert(supportVisits)
        .values({
          id: newId(),
          staffId: staff.sub,
          staffName: staff.name,
          staffEmail: staff.email,
          userId: member.id,
          reason: staff.reason,
          endsAt: sql`now() + make_interval(hours => ${SUPPORT_VISIT_HOURS})`,
        })
        .returning(),
    );

    await runAs(
      { type: 'user', userId: member.id, role: 'owner', permissions: [], support: true },
      () =>
        recordAudit(tx, {
          action: 'support.entered',
          targetType: 'support_visit',
          targetId: visit.id,
          targetLabel: staff.name,
          metadata: { reason: staff.reason, staffEmail: staff.email },
        }),
    );

    return member;
  });

const organizationAt = async (subdomain: string) => {
  const [row] = await withSystem('support: organisation', (tx) =>
    tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(sql`lower(${organizations.subdomain})`, subdomain))
      .limit(1),
  );

  return row?.id;
};

/** Back to erxes.io, which tells the admin why they didn't get in. */
const refused = (res: Response, subdomain: string, status: 'off' | 'invalid') =>
  res.redirect(
    302,
    `${config.saas.platformUrl}/support-access/result?${new URLSearchParams({ subdomain, status }).toString()}`,
  );

/**
 * `GET /core/v1/saas/support-login?token=`: an erxes.io admin's "Open as support". erxes.io
 * signs who they are and why (ES256, one minute, once); core signs them in as their own
 * support member for `SUPPORT_VISIT_HOURS`, unless the owners turned support access off.
 */
export const supportLogin = async (req: Request, res: Response) => {
  const subdomain = subdomainFromHost(req.get('x-forwarded-host') ?? req.get('host')) ?? '';
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  const staff =
    supportAvailable() && subdomain
      ? await verifySupportLink(token, subdomain).catch((error: unknown) => {
          req.log.warn({ err: error }, 'support link refused');

          return null;
        })
      : null;

  const orgId = staff && (await organizationAt(subdomain));

  if (!staff || !orgId) return refused(res, subdomain, 'invalid');

  const member = await enter(orgId, staff);

  if (!member) return refused(res, subdomain, 'off');

  req.log.info({ orgId, staffId: staff.sub }, 'erxes support entered');
  await startSession(req, res, { userId: member.id, orgId, sessionVersion: member.sessionVersion });
  res.redirect(302, '/');
};
