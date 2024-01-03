import * as Types from '../../../gql/types';

export type RisksAddMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  code: Types.Scalars['String']['input'];
  description: Types.Scalars['String']['input'];
}>;

export type RisksAddMutation = {
  __typename?: 'Mutation';
  risksAdd?: { __typename?: 'Risk'; _id: string } | null;
};

export type RisksEditMutationVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
  name: Types.Scalars['String']['input'];
  code: Types.Scalars['String']['input'];
  description: Types.Scalars['String']['input'];
}>;

export type RisksEditMutation = {
  __typename?: 'Mutation';
  risksEdit?: { __typename?: 'Risk'; _id: string } | null;
};

export type RisksRemoveMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;

export type RisksRemoveMutation = {
  __typename?: 'Mutation';
  risksRemove?: string | null;
};
