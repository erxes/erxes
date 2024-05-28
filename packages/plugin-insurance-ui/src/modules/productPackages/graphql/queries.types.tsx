import * as Types from '../../../gql/types';

export type InsurancePackageListQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type InsurancePackageListQuery = {
  __typename?: 'Query';
  insurancePackageList?: {
    __typename?: 'InsurancePackageList';
    totalCount: number;
    list: Array<{
      __typename?: 'InsurancePackage';
      _id: string;
      name: string;
      productIds: Array<string>;
      createdAt: any;
      products?: Array<{
        __typename?: 'InsuranceProduct';
        _id: string;
        code?: string | null;
        name?: string | null;
      } | null> | null;
      lastModifiedBy?: {
        __typename?: 'User';
        _id: string;
        email?: string | null;
        details?: {
          __typename?: 'UserDetailsType';
          avatar?: string | null;
          firstName?: string | null;
          fullName?: string | null;
          lastName?: string | null;
          middleName?: string | null;
          shortName?: string | null;
        } | null;
      } | null;
    }>;
  } | null;
};

export type InsurancePackageQueryVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
}>;

export type InsurancePackageQuery = {
  __typename?: 'Query';
  insurancePackage?: {
    __typename?: 'InsurancePackage';
    createdAt: any;
    _id: string;
    lastModifiedAt?: any | null;
    name: string;
    productIds: Array<string>;
    lastModifiedBy?: { __typename?: 'User'; _id: string } | null;
    products?: Array<{
      __typename?: 'InsuranceProduct';
      _id: string;
      code?: string | null;
      createdAt?: any | null;
      description?: string | null;
      name?: string | null;
      price?: number | null;
      updatedAt?: any | null;
      companyProductConfigs?: Array<{
        __typename?: 'CompanyProductConfig';
        companyId: string;
        specificPrice?: number | null;
      } | null> | null;
      lastModifiedBy?: { __typename?: 'User'; _id: string } | null;
    } | null> | null;
  } | null;
};
