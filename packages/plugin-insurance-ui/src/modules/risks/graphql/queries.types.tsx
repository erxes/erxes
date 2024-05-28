import * as Types from '../../../gql/types';

export type RisksPaginatedQueryVariables = Types.Exact<{
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  perPage?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sortField?: Types.InputMaybe<Types.Scalars['String']['input']>;
  sortDirection?: Types.InputMaybe<Types.SortDirection>;
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type RisksPaginatedQuery = {
  __typename?: 'Query';
  risksPaginated?: {
    __typename?: 'RiskPage';
    count?: number | null;
    risks?: Array<{
      __typename?: 'Risk';
      _id: string;
      name?: string | null;
      code?: string | null;
      description?: string | null;
      updatedAt?: any | null;
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
    } | null> | null;
  } | null;
};

export type RisksQueryVariables = Types.Exact<{
  searchValue?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type RisksQuery = {
  __typename?: 'Query';
  risks?: Array<{
    __typename?: 'Risk';
    _id: string;
    code?: string | null;
    name?: string | null;
  } | null> | null;
};
