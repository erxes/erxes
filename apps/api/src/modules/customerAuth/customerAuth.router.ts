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
import { signInMethods } from './customerMethods';
import { confirmSignUp, sendSignUpCode, signUpFields } from './customerSignUp';
import { signInWithSocial } from './customerSocial';
import { portalOfCall } from './portalCalls';

/** The portal the call's `X-Portal-Token` names, the browser's address checked. */
const signInRequest = async (context: CoreContext): Promise<SignInRequest> => {
  const { req } = httpOf(context);

  return { portal: await portalOfCall(req.get('x-portal-token'), req.get('origin')) };
};

export const customerAuthRouter = {
  methods: unscoped.customerAuth.methods.handler(async ({ context }) =>
    signInMethods(await signInRequest(context)),
  ),
  social: unscoped.customerAuth.social.handler(async ({ input, context }) =>
    signInWithSocial(input, await signInRequest(context)),
  ),
  fields: unscoped.customerAuth.fields.handler(async ({ context }) =>
    signUpFields(await signInRequest(context)),
  ),
  signUp: unscoped.customerAuth.signUp.handler(async ({ input, context }) =>
    sendSignUpCode(input, await signInRequest(context)),
  ),
  confirmSignUp: unscoped.customerAuth.confirmSignUp.handler(async ({ input, context }) =>
    confirmSignUp(input, await signInRequest(context)),
  ),
  sendCode: unscoped.customerAuth.sendCode.handler(async ({ input, context }) =>
    sendSignInCode(input, await signInRequest(context)),
  ),
  signIn: unscoped.customerAuth.signIn.handler(async ({ input, context }) =>
    signInWithCode(input, await signInRequest(context)),
  ),
  refresh: unscoped.customerAuth.refresh.handler(async ({ input, context }) =>
    refreshTokens(input, await signInRequest(context)),
  ),
  signOut: unscoped.customerAuth.signOut.handler(async ({ input, context }) => {
    await signInRequest(context);

    return signOut(input.refreshToken);
  }),
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
