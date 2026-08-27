export type CurrentUser = {
  _id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isVerified: boolean;
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

export const loginToken = (
  result: LoginResponse['clientPortalUserLoginWithCredentials'],
): string | null =>
  typeof result === 'object' && result?.token ? result.token : null;

export const displayName = (user: CurrentUser): string => {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return full || user.username || user.email || 'Хэрэглэгч';
};
