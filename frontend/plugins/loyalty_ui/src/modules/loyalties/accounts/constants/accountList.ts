export const LOYALTY_ACCOUNT_CURSOR_SESSION_KEY =
  'loyalty_account_cursor_session_key';

// URL query keys of the accounts page filters.
export const ACCOUNT_FILTER_KEYS = {
  searchValue: 'searchValue',
  status: 'accountStatus',
  ownerType: 'accountOwnerType',
  accountTypeId: 'accountTypeId',
  tier: 'accountTier',
} as const;

export const ACCOUNT_STATUS_OPTIONS = ['active', 'frozen'] as const;
export const ACCOUNT_OWNER_TYPE_OPTIONS = [
  'customer',
  'company',
  'user',
] as const;
// Matches the server's "holds this account type without a tier".
export const ACCOUNT_NO_TIER = 'none';
