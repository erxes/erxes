const PUBLIC = { public: true } as const;
const CUSTOMER = { customer: true } as const;

/** The customer side of the access map: their sign-in, account and notifications. */
export const CUSTOMER_ACCESS = {
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
