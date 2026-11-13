import { isCrossSiteWrite } from '~/http/auth';
import { readCookies } from '~/http/cookies';
import { HttpError } from '~/http/errors';
import { customer, pub, type CoreContext } from '~/orpc';
import {
  confirmAddLogin,
  myLogins,
  myProfile,
  mySessions,
  removeMyLogin,
  revokeMySession,
  sendAddLoginCode,
  sendSignInCode,
  signInConfig,
  signInWithCode,
  signOutEverywhere,
  updateMyProfile,
} from './customerAuth.service';
import { CUSTOMER_COOKIE, customerCookieOptions, revokeSessionToken } from './customerSessions';

/** Only core's own sign-in page may sign this browser in or out (no login CSRF). */
const fromSignInPage = (context: CoreContext) => {
  if (isCrossSiteWrite(context.req)) {
    throw new HttpError(403, 'CROSS_SITE', 'Cross-site request blocked');
  }

  return readCookies(context.req.headers.cookie)[CUSTOMER_COOKIE];
};

export const customerAuthRouter = {
  config: pub.customerAuth.config.handler(({ input, context }) =>
    signInConfig(input, context.req.get('host')),
  ),
  sendCode: pub.customerAuth.sendCode.handler(({ input, context }) =>
    sendSignInCode(input, context.req.get('host')),
  ),
  signIn: pub.customerAuth.signIn.handler(async ({ input, context }) => {
    const previous = fromSignInPage(context);
    const { token, ...result } = await signInWithCode(input, context.req.get('host'), previous);

    context.res.cookie(CUSTOMER_COOKIE, token, customerCookieOptions(context.req));

    return result;
  }),
  signOut: pub.customerAuth.signOut.handler(async ({ context }) => {
    await revokeSessionToken(fromSignInPage(context), null);
    context.res.clearCookie(CUSTOMER_COOKIE, {
      ...customerCookieOptions(context.req),
      maxAge: undefined,
    });

    return { ok: true as const };
  }),
};

export const customerAccountRouter = {
  me: customer.customerAccount.me.handler(({ context }) => myProfile(context.customer)),
  update: customer.customerAccount.update.handler(({ input, context }) =>
    updateMyProfile(context.customer, input),
  ),
  logins: customer.customerAccount.logins.handler(({ context }) => myLogins(context.customer)),
  addLogin: customer.customerAccount.addLogin.handler(({ input, context }) =>
    sendAddLoginCode(context.customer, input),
  ),
  confirmLogin: customer.customerAccount.confirmLogin.handler(({ input, context }) =>
    confirmAddLogin(context.customer, input),
  ),
  removeLogin: customer.customerAccount.removeLogin.handler(({ input, context }) =>
    removeMyLogin(context.customer, input.id),
  ),
  sessions: customer.customerAccount.sessions.handler(({ context }) =>
    mySessions(context.customer),
  ),
  revokeSession: customer.customerAccount.revokeSession.handler(({ input, context }) =>
    revokeMySession(context.customer, input.id),
  ),
  signOutEverywhere: customer.customerAccount.signOutEverywhere.handler(({ context }) =>
    signOutEverywhere(context.customer),
  ),
};
