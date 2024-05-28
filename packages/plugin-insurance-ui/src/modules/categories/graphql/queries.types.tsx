import * as Types from '../../../gql/types';

export type InsuranceCategoryListQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sortField?: Types.InputMaybe<Types.Scalars['String']['input']>;
  sortDirection?: Types.InputMaybe<Types.SortDirection>;
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type InsuranceCategoryListQuery = {
  __typename?: 'Query';
  insuranceCategoryList?: {
    __typename?: 'InsuranceCategoryList';
    totalCount?: number | null;
    list?: Array<{
      __typename?: 'InsuranceCategory';
      _id: string;
      name?: string | null;
      code?: string | null;
      description?: string | null;
      lastModifiedAt?: any | null;
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
      risks?: Array<{
        __typename?: 'Risk';
        _id: string;
        name?: string | null;
        code?: string | null;
      } | null> | null;
    } | null> | null;
  } | null;
};

export type InsuranceCategoriesQueryVariables = Types.Exact<{
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type InsuranceCategoriesQuery = {
  __typename?: 'Query';
  insuranceCategories?: Array<{
    __typename?: 'InsuranceCategory';
    _id: string;
    name?: string | null;
    risks?: Array<{
      __typename?: 'Risk';
      _id: string;
      name?: string | null;
    } | null> | null;
  } | null> | null;
};
