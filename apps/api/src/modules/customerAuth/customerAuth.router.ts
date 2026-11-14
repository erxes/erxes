import { subdomainFromHost } from '~/modules/auth/auth.service';
import { unscoped, type CoreContext } from '~/orpc';
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
  sendCode: unscoped.customerAuth.sendCode.handler(({ input, context }) =>
    sendSignInCode(input, appRequest(context)),
  ),
  signIn: unscoped.customerAuth.signIn.handler(({ input, context }) =>
    signInWithCode(input, appRequest(context)),
  ),
  refresh: unscoped.customerAuth.refresh.handler(({ input, context }) =>
    refreshTokens(input, appRequest(context)),
  ),
  signOut: unscoped.customerAuth.signOut.handler(({ input }) => signOut(input.refreshToken)),
};

export const customerAccountRouter = {
  me: unscoped.customerAccount.me.handler(() => myProfile()),
  update: unscoped.customerAccount.update.handler(({ input }) => updateMyProfile(input)),
  logins: unscoped.customerAccount.logins.handler(() => myLogins()),
  addLogin: unscoped.customerAccount.addLogin.handler(({ input }) => sendAddLoginCode(input)),
  confirmLogin: unscoped.customerAccount.confirmLogin.handler(({ input }) =>
    confirmAddLogin(input),
  ),
  removeLogin: unscoped.customerAccount.removeLogin.handler(({ input }) => removeMyLogin(input.id)),
  sessions: unscoped.customerAccount.sessions.handler(() => mySessions()),
  revokeSession: unscoped.customerAccount.revokeSession.handler(({ input }) =>
    revokeMySession(input.id),
  ),
  signOutEverywhere: unscoped.customerAccount.signOutEverywhere.handler(() => signOutEverywhere()),
};
