import type { SessionUser } from '../utils/session';

export type CurrentUser = {
  _id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isVerified: boolean;
  /** erxes files this account's tickets and contact details under the customer. */
  erxesCustomerId: string | null;
};

export type CurrentUserResponse = {
  clientPortalCurrentUser: CurrentUser | null;
};

export type RegisterResponse = {
  clientPortalUserRegister: { _id: string; isVerified: boolean } | null;
};

export type LoginResponse = {
  clientPortalUserLoginWithCredentials:
    | string
    | { success?: boolean; token?: string; refreshToken?: string }
    | null;
};

export type PortalCustomer = {
  _id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
};

export type CustomerEditResponse = {
  clientPortalCustomerEdit: PortalCustomer | null;
};

export const loginToken = (
  result: LoginResponse['clientPortalUserLoginWithCredentials'],
): string | null =>
  typeof result === 'object' && result?.token ? result.token : null;

export const displayName = (user: CurrentUser): string => {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return full || user.username || user.email || 'Хэрэглэгч';
};

export const sessionFromCurrentUser = (
  user: CurrentUser,
  fallbackEmail = '',
): SessionUser => ({
  name: displayName(user),
  email: user.email ?? fallbackEmail,
  ...(user.phone ? { phone: user.phone } : {}),
  ...(user.erxesCustomerId ? { customerId: user.erxesCustomerId } : {}),
  cpUserId: user._id,
});
