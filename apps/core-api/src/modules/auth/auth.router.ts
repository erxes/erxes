import { db, withOrg, withSystem } from '@erxes/core-db';
import { config } from '~/config';
import {
  completeTwoFactor,
  disableTwoFactor,
  enableTwoFactor,
  regenerateRecoveryCodes,
  setupTwoFactor,
} from '~/modules/auth/twoFactor.service';
import { acceptInvitation, invitationInfo } from '~/modules/auth/tokens.service';
import { requestPasswordReset, resetPassword } from '~/modules/auth/passwordReset.service';
import { sessionClaims, signAccessToken } from '~/http/auth';
import { recordAudit } from '~/modules/audit/audit.service';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';
import {
  changeOwnPassword,
  mySignIns,
  sessionVersionOf,
  signOutEverywhere,
} from '~/modules/auth/account.service';
import { getSession, markOnboarded, signIn, recordSignedIn } from '~/modules/auth/auth.service';
import { runSetup, setupRequired } from '~/modules/setup/setup.service';
import { pub, authed, type CoreContext } from '~/orpc';

/** Signs the member in on this browser (HttpOnly session cookie). */
const startSession = async (context: CoreContext, userId: string, orgId: string) => {
  const version = await withOrg(orgId, () => sessionVersionOf(userId));
  const token = await signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60, version);

  context.res.cookie(SESSION_COOKIE, token, sessionCookieOptions(context.req));
};

const endSession = (context: CoreContext) =>
  context.res.clearCookie(SESSION_COOKIE, {
    ...sessionCookieOptions(context.req),
    maxAge: undefined,
  });

export const authRouter = {
  setupStatus: pub.auth.setupStatus.handler(async () => ({
    required: await withSystem('setup status', (tx) => setupRequired(tx)),
  })),
  setup: pub.auth.setup.handler(async ({ input, context }) => {
    const { organization, owner } = await runSetup(input);

    await startSession(context, owner.id, organization.id);

    return getSession(organization.id, owner.id);
  }),
  signIn: pub.auth.signIn.handler(async ({ input, context }) => {
    const result = await signIn(input, context.req.get('host'));

    // Two-factor: no session until the second step.
    if ('challenge' in result) return result;

    await startSession(context, result.user.id, result.organization.id);

    return result;
  }),
  signInTwoFactor: pub.auth.signInTwoFactor.handler(async ({ input, context }) => {
    const { orgId, userId } = await completeTwoFactor(input);
    const session = await getSession(orgId, userId);

    await recordSignedIn(orgId, userId, session.user.email, {
      twoFactor: input.code ? 'app' : 'recovery code',
    });
    await startSession(context, userId, orgId);

    return session;
  }),
  twoFactorSetup: authed.auth.twoFactorSetup.handler(({ context }) =>
    setupTwoFactor(db(), context.actor),
  ),
  twoFactorEnable: authed.auth.twoFactorEnable.handler(async ({ input, context }) => {
    const result = await enableTwoFactor(db(), context.actor, input.code);

    // Other sessions ended; this browser stays signed in.
    if (!context.req.headers.authorization)
      await startSession(context, context.actor.userId, context.actor.orgId);

    return result;
  }),
  twoFactorDisable: authed.auth.twoFactorDisable.handler(({ input, context }) =>
    disableTwoFactor(db(), context.actor, input.password),
  ),
  twoFactorRecoveryCodes: authed.auth.twoFactorRecoveryCodes.handler(({ input, context }) =>
    regenerateRecoveryCodes(db(), context.actor, input.password),
  ),
  signOut: pub.auth.signOut.handler(async ({ context }) => {
    const session = await sessionClaims(context.req);

    if (session) {
      await withOrg(session.orgId, (tx) =>
        recordAudit(
          tx,
          { orgId: session.orgId, actorType: 'user', actorId: session.userId, source: 'core' },
          { action: 'auth.signed_out', targetType: 'user', targetId: session.userId },
        ),
      );
    }

    endSession(context);

    return { ok: true as const };
  }),
  me: authed.auth.me.handler(({ context }) =>
    getSession(context.actor.orgId, context.actor.userId),
  ),
  onboarded: authed.auth.onboarded.handler(({ input, context }) =>
    markOnboarded(context.actor, input ?? {}),
  ),
  changePassword: authed.auth.changePassword.handler(async ({ input, context }) => {
    const result = await changeOwnPassword(context.actor, input);

    // Other sessions ended; this browser stays signed in (bearer callers get a fresh token next sign-in).
    if (!context.req.headers.authorization)
      await startSession(context, context.actor.userId, context.actor.orgId);

    return result;
  }),
  requestPasswordReset: pub.auth.requestPasswordReset.handler(({ input }) =>
    requestPasswordReset(input),
  ),
  resetPassword: pub.auth.resetPassword.handler(async ({ input, context }) => {
    const { orgId, userId } = await resetPassword(input);

    await startSession(context, userId, orgId);

    return getSession(orgId, userId);
  }),
  invitation: pub.auth.invitation.handler(({ input }) => invitationInfo(input.token)),
  acceptInvitation: pub.auth.acceptInvitation.handler(async ({ input, context }) => {
    const { orgId, userId } = await acceptInvitation(input);

    await startSession(context, userId, orgId);

    return getSession(orgId, userId);
  }),
  signOutEverywhere: authed.auth.signOutEverywhere.handler(async ({ context }) => {
    const result = await signOutEverywhere(context.actor);

    endSession(context);

    return result;
  }),
  signIns: authed.auth.signIns.handler(({ context }) => mySignIns(context.actor)),
};
