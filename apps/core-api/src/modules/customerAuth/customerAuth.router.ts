import { subdomainFromHost } from '~/modules/auth/auth.service';
import { customer, pub, type CoreContext } from '~/orpc';
import type { AppRequest } from './customerApps';
import {
  confirmAddLogin,
  myLogins,
  myProfile,
  mySessions,
  refreshTokens,
  removeMyLogin,
  revokeMySession,
  sendAddLoginCode,
  sendSignInCode,
  signInWithCode,
  signOut,
  signOutEverywhere,
  updateMyProfile,
} from './customerAuth.service';

const appRequest = ({ req }: CoreContext): AppRequest => ({
  subdomain: subdomainFromHost(req.get('host')),
  origin: req.get('origin'),
});

export const customerAuthRouter = {
  sendCode: pub.customerAuth.sendCode.handler(({ input, context }) =>
    sendSignInCode(input, appRequest(context)),
  ),
  signIn: pub.customerAuth.signIn.handler(({ input, context }) =>
    signInWithCode(input, appRequest(context)),
  ),
  refresh: pub.customerAuth.refresh.handler(({ input, context }) =>
    refreshTokens(input, appRequest(context)),
  ),
  signOut: pub.customerAuth.signOut.handler(({ input }) => signOut(input.refreshToken)),
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
