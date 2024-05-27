import * as Types from '../../../gql/types';

export type InsuranceCategoryAddMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  code: Types.Scalars['String']['input'];
  description: Types.Scalars['String']['input'];
  riskIds?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.Scalars['String']['input']>>
    | Types.InputMaybe<Types.Scalars['String']['input']>
  >;
}>;

export type InsuranceCategoryAddMutation = {
  __typename?: 'Mutation';
  insuranceCategoryAdd?: {
    __typename?: 'InsuranceCategory';
    _id: string;
    name?: string | null;
  } | null;
};

export type InsuranceCategoryEditMutationVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
  code?: Types.InputMaybe<Types.Scalars['String']['input']>;
  description?: Types.InputMaybe<Types.Scalars['String']['input']>;
  riskIds?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.Scalars['String']['input']>>
    | Types.InputMaybe<Types.Scalars['String']['input']>
  >;
}>;

export type InsuranceCategoryEditMutation = {
  __typename?: 'Mutation';
  insuranceCategoryEdit?: {
    __typename?: 'InsuranceCategory';
    _id: string;
    name?: string | null;
  } | null;
};

export type InsuranceCategoryRemoveMutationVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
}>;

export type InsuranceCategoryRemoveMutation = {
  __typename?: 'Mutation';
  insuranceCategoryRemove?: string | null;
};
