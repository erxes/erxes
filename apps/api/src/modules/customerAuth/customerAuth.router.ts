import { httpOf, unscoped, type CoreContext } from '~/orpc';
import {
  confirmAddLogin,
  myLogins,
  myProfile,
  mySessions,
  removeMyLogin,
  revokeMySession,
  sendAddLoginCode,
  signOutEverywhere,
  updateMyProfile,
} from './customerAccount.service';
import {
  refreshTokens,
  sendSignInCode,
  signInWithCode,
  signOut,
  type SignInRequest,
} from './customerAuth.service';

const signInRequest = (context: CoreContext): SignInRequest => ({
  origin: httpOf(context).req.get('origin'),
});

export const customerAuthRouter = {
  sendCode: unscoped.customerAuth.sendCode.handler(({ input, context }) =>
    sendSignInCode(input, signInRequest(context)),
  ),
  signIn: unscoped.customerAuth.signIn.handler(({ input, context }) =>
    signInWithCode(input, signInRequest(context)),
  ),
  refresh: unscoped.customerAuth.refresh.handler(({ input, context }) =>
    refreshTokens(input, signInRequest(context)),
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
