import * as Types from '../../../gql/types';

export type InsuranceProductsPaginatedQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sortField?: Types.InputMaybe<Types.Scalars['String']['input']>;
  sortDirection?: Types.InputMaybe<Types.SortDirection>;
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type InsuranceProductsPaginatedQuery = {
  __typename?: 'Query';
  insuranceProductsPaginated?: {
    __typename?: 'InsuranceProductPage';
    count?: number | null;
    products?: Array<{
      __typename?: 'InsuranceProduct';
      _id: string;
      name?: string | null;
      code?: string | null;
      price?: number | null;
      description?: string | null;
      updatedAt?: any | null;
      riskIds?: Array<string | null> | null;
      lastModifiedBy?: {
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
      } | null;
      companyProductConfigs?: Array<{
        __typename?: 'CompanyProductConfig';
        companyId: string;
        specificPrice?: number | null;
      } | null> | null;
      risks?: Array<{
        __typename?: 'Risk';
        _id: string;
        name?: string | null;
        code?: string | null;
        description?: string | null;
        updatedAt?: any | null;
      } | null> | null;
    } | null> | null;
  } | null;
};
