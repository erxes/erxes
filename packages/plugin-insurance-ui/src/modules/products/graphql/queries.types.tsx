import * as Types from '../../../gql/types';

export type InsuranceProductListQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sortField?: Types.InputMaybe<Types.Scalars['String']['input']>;
  sortDirection?: Types.InputMaybe<Types.SortDirection>;
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type InsuranceProductListQuery = {
  __typename?: 'Query';
  insuranceProductList?: {
    __typename?: 'InsuranceProductList';
    totalCount?: number | null;
    list?: Array<{
      __typename?: 'InsuranceProduct';
      _id: string;
      name?: string | null;
      code?: string | null;
      price?: number | null;
      description?: string | null;
      updatedAt?: any | null;
      categoryId?: string | null;
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
    } | null> | null;
  } | null;
};

export type InsuranceProductsQueryVariables = Types.Exact<{
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type InsuranceProductsQuery = {
  __typename?: 'Query';
  insuranceProducts?: Array<{
    __typename?: 'InsuranceProduct';
    _id: string;
    name?: string | null;
  } | null> | null;
};
