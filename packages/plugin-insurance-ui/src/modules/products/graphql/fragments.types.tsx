import * as Types from '../../../gql/types';

export type RiskCoreFieldsFragment = {
  __typename?: 'Risk';
  _id: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  updatedAt?: any | null;
};

export type ProductCoreFieldsFragment = {
  __typename?: 'InsuranceProduct';
  _id: string;
  name?: string | null;
  code?: string | null;
  price?: number | null;
  description?: string | null;
  updatedAt?: any | null;
  categoryId?: string | null;
  companyProductConfigs?: Array<{
    __typename?: 'CompanyProductConfig';
    companyId: string;
    specificPrice?: number | null;
  } | null> | null;
  riskConfigs?: Array<{
    __typename?: 'RiskConfig';
    riskId: string;
    coverage?: number | null;
    coverageLimit?: number | null;
  } | null> | null;
  category?: {
    __typename?: 'InsuranceCategory';
    _id: string;
    name?: string | null;
    risks?: Array<{
      __typename?: 'Risk';
      _id: string;
      name?: string | null;
    } | null> | null;
  } | null;
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
