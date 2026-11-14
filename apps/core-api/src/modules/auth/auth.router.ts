import { caller, db, requestOrgId, runAs, withOrg, withSystem } from '@erxes/core-db';
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
import { memberOf, sessionClaims, signAccessToken } from '~/http/auth';
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
import { scoped, unscoped, type CoreContext } from '~/orpc';

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
  setupStatus: unscoped.auth.setupStatus.handler(async () => ({
    required: await withSystem('setup status', (tx) => setupRequired(tx)),
  })),
  setup: unscoped.auth.setup.handler(async ({ input, context }) => {
    const { organization, owner } = await runSetup(input);

    await startSession(context, owner.id, organization.id);

    return getSession(organization.id, owner.id);
  }),
  signIn: unscoped.auth.signIn.handler(async ({ input, context }) => {
    const result = await signIn(input, context.req.get('host'));

    // Two-factor: no session until the second step.
    if ('challenge' in result) return result;

    await startSession(context, result.user.id, result.organization.id);

    return result;
  }),
  signInTwoFactor: unscoped.auth.signInTwoFactor.handler(async ({ input, context }) => {
    const { orgId, userId } = await completeTwoFactor(input);
    const session = await getSession(orgId, userId);

    await recordSignedIn(session.user, { twoFactor: input.code ? 'app' : 'recovery code' });
    await startSession(context, userId, orgId);

    return session;
  }),
  twoFactorSetup: scoped.auth.twoFactorSetup.handler(() => setupTwoFactor(db())),
  twoFactorEnable: scoped.auth.twoFactorEnable.handler(async ({ input, context }) => {
    const result = await enableTwoFactor(db(), input.code);

    // Other sessions ended; this browser stays signed in.
    if (!context.req.headers.authorization)
      await startSession(context, caller('user').userId, requestOrgId());

    return result;
  }),
  twoFactorDisable: scoped.auth.twoFactorDisable.handler(({ input }) =>
    disableTwoFactor(db(), input.password),
  ),
  twoFactorRecoveryCodes: scoped.auth.twoFactorRecoveryCodes.handler(({ input }) =>
    regenerateRecoveryCodes(db(), input.password),
  ),
  signOut: unscoped.auth.signOut.handler(async ({ context }) => {
    const session = await sessionClaims(context.req);

    const member = session && (await memberOf(session.orgId, session.userId));

    if (session && member) {
      await withOrg(session.orgId, (tx) =>
        runAs(member, () =>
          recordAudit(tx, {
            action: 'auth.signed_out',
            targetType: 'user',
            targetId: session.userId,
          }),
        ),
      );
    }

    endSession(context);

    return { ok: true as const };
  }),
  me: scoped.auth.me.handler(() => getSession(requestOrgId(), caller('user').userId)),
  onboarded: scoped.auth.onboarded.handler(({ input }) => markOnboarded(input ?? {})),
  changePassword: scoped.auth.changePassword.handler(async ({ input, context }) => {
    const result = await changeOwnPassword(input);

    // Other sessions ended; this browser stays signed in (bearer callers get a fresh token next sign-in).
    if (!context.req.headers.authorization)
      await startSession(context, caller('user').userId, requestOrgId());

    return result;
  }),
  requestPasswordReset: unscoped.auth.requestPasswordReset.handler(({ input }) =>
    requestPasswordReset(input),
  ),
  resetPassword: unscoped.auth.resetPassword.handler(async ({ input, context }) => {
    const { orgId, userId } = await resetPassword(input);

    await startSession(context, userId, orgId);

    return getSession(orgId, userId);
  }),
  invitation: unscoped.auth.invitation.handler(({ input }) => invitationInfo(input.token)),
  acceptInvitation: unscoped.auth.acceptInvitation.handler(async ({ input, context }) => {
    const { orgId, userId } = await acceptInvitation(input);

    await startSession(context, userId, orgId);

    return getSession(orgId, userId);
  }),
  signOutEverywhere: scoped.auth.signOutEverywhere.handler(async ({ context }) => {
    const result = await signOutEverywhere();

    endSession(context);

    return result;
  }),
  signIns: scoped.auth.signIns.handler(() => mySignIns()),
};
