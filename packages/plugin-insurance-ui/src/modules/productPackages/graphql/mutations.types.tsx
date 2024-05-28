import * as Types from '../../../gql/types';

export type InsurancePackageAddMutationVariables = Types.Exact<{
  input: Types.InsurancePackageInput;
}>;

export type InsurancePackageAddMutation = {
  __typename?: 'Mutation';
  insurancePackageAdd: { __typename?: 'InsurancePackage'; _id: string };
};

export type InsurancePackageEditMutationVariables = Types.Exact<{
  input: Types.InsurancePackageInput;
  _id: Types.Scalars['ID']['input'];
}>;

export type InsurancePackageEditMutation = {
  __typename?: 'Mutation';
  insurancePackageEdit: { __typename?: 'InsurancePackage'; _id: string };
};

export type InsurancePackageRemoveMutationVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
}>;

export type InsurancePackageRemoveMutation = {
  __typename?: 'Mutation';
  insurancePackageRemove?: any | null;
};
