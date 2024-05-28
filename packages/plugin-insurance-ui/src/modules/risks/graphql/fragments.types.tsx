import * as Types from '../../../gql/types';

export type RiskCoreFieldsFragment = {
  __typename?: 'Risk';
  _id: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  updatedAt?: any | null;
};

export type TeamMemberFieldsFragment = {
  __typename?: 'User';
  _id: string;
  username?: string | null;
  email?: string | null;
  details?: {
    __typename?: 'UserDetailsType';
    firstName?: string | null;
    fullName?: string | null;
    lastName?: string | null;
    shortName?: string | null;
    middleName?: string | null;
    avatar?: string | null;
  } | null;
};
