import * as Types from '../../../gql/types';

export type InsuranceProductsAddMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  code: Types.Scalars['String']['input'];
  description: Types.Scalars['String']['input'];
  price: Types.Scalars['Float']['input'];
  riskIds?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.Scalars['ID']['input']>>
    | Types.InputMaybe<Types.Scalars['ID']['input']>
  >;
  companyConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.CompanyProductConfigInput>>
    | Types.InputMaybe<Types.CompanyProductConfigInput>
  >;
}>;

export type InsuranceProductsAddMutation = {
  __typename?: 'Mutation';
  insuranceProductsAdd?: {
    __typename?: 'InsuranceProduct';
    _id: string;
  } | null;
};

export type InsuranceProductsEditMutationVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
  code?: Types.InputMaybe<Types.Scalars['String']['input']>;
  description?: Types.InputMaybe<Types.Scalars['String']['input']>;
  price?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  riskIds?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.Scalars['ID']['input']>>
    | Types.InputMaybe<Types.Scalars['ID']['input']>
  >;
  companyConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.CompanyProductConfigInput>>
    | Types.InputMaybe<Types.CompanyProductConfigInput>
  >;
}>;

export type InsuranceProductsEditMutation = {
  __typename?: 'Mutation';
  insuranceProductsEdit?: {
    __typename?: 'InsuranceProduct';
    _id: string;
  } | null;
};

export type InsuranceProductsRemoveMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;

export type InsuranceProductsRemoveMutation = {
  __typename?: 'Mutation';
  insuranceProductsRemove?: string | null;
};
