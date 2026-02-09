export interface ICPUser {
  _id: string;
  type?: string;
  email?: string;
  phone?: string;
  username?: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  clientPortalId: string;
  clientPortal?: { _id: string; name?: string };
  erxesCustomerId?: string;
  erxesCompanyId?: string;
  customFieldsData?: Record<string, unknown>;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  failedLoginAttempts?: number;
  accountLockedUntil?: string;
  lastLoginAt?: string;
  primaryAuthMethod?: string;
  /** FCM devices (list query may omit token) */
  fcmTokens?: { deviceId: string; token?: string; platform: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICPUserListResponse {
  list: ICPUser[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}
