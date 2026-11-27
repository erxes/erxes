import { MEMBER, PUBLIC } from './policyRules';

/** The members' side of the access map: setup, sign-in, two-factor, passwords and invitations. */
export const AUTH_ACCESS = {
  'auth.setupStatus': PUBLIC,
  'auth.setup': PUBLIC,
  'auth.signIn': PUBLIC,
  'auth.signInProviders': PUBLIC,
  'auth.signInWithProvider': PUBLIC,
  'auth.signOut': PUBLIC,
  'auth.signOutEverywhere': MEMBER,
  'auth.signInTwoFactor': PUBLIC,
  'auth.twoFactorSetup': MEMBER,
  'auth.twoFactorEnable': MEMBER,
  'auth.twoFactorDisable': MEMBER,
  'auth.twoFactorRecoveryCodes': MEMBER,
  'auth.requestPasswordReset': PUBLIC,
  'auth.resetPassword': PUBLIC,
  'auth.invitation': PUBLIC,
  'auth.acceptInvitation': PUBLIC,
  'auth.me': MEMBER,
  'auth.onboarded': MEMBER,
  'auth.changePassword': MEMBER,
  'auth.signIns': MEMBER,
} as const;
