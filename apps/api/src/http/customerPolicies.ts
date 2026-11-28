import { CUSTOMER, PUBLIC } from './policyRules';

/** The customer side of the access map: their sign-in, account, notifications and contact form. */
export const CUSTOMER_ACCESS = {
  'portalContact.send': PUBLIC,

  'customerAuth.methods': PUBLIC,
  'customerAuth.social': PUBLIC,
  'customerAuth.fields': PUBLIC,
  'customerAuth.signUp': PUBLIC,
  'customerAuth.confirmSignUp': PUBLIC,
  'customerAuth.sendCode': PUBLIC,
  'customerAuth.signIn': PUBLIC,
  'customerAuth.refresh': PUBLIC,
  'customerAuth.signOut': PUBLIC,

  'customerAccount.me': CUSTOMER,
  'customerAccount.update': CUSTOMER,
  'customerAccount.logins': CUSTOMER,
  'customerAccount.addLogin': CUSTOMER,
  'customerAccount.confirmLogin': CUSTOMER,
  'customerAccount.removeLogin': CUSTOMER,
  'customerAccount.sessions': CUSTOMER,
  'customerAccount.revokeSession': CUSTOMER,
  'customerAccount.signOutEverywhere': CUSTOMER,

  'customerNotifications.create': { plugin: 'notifications:write' },
  'customerNotifications.list': CUSTOMER,
  'customerNotifications.unreadCount': CUSTOMER,
  'customerNotifications.markRead': CUSTOMER,
} as const;
