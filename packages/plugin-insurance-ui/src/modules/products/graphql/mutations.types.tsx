import * as Types from '../../../gql/types';

export type InsuranceProductsAddMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  code: Types.Scalars['String']['input'];
  description: Types.Scalars['String']['input'];
  price: Types.Scalars['Float']['input'];
  riskConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.RiskConfigInput>>
    | Types.InputMaybe<Types.RiskConfigInput>
  >;
  categoryId: Types.Scalars['ID']['input'];
  companyProductConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.CompanyProductConfigInput>>
    | Types.InputMaybe<Types.CompanyProductConfigInput>
  >;
  customFieldsData?: Types.InputMaybe<Types.Scalars['JSON']['input']>;
  travelProductConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.TravelProductConfigInput>>
    | Types.InputMaybe<Types.TravelProductConfigInput>
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
  riskConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.RiskConfigInput>>
    | Types.InputMaybe<Types.RiskConfigInput>
  >;
  categoryId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  companyProductConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.CompanyProductConfigInput>>
    | Types.InputMaybe<Types.CompanyProductConfigInput>
  >;
  customFieldsData?: Types.InputMaybe<Types.Scalars['JSON']['input']>;
  travelProductConfigs?: Types.InputMaybe<
    | Array<Types.InputMaybe<Types.TravelProductConfigInput>>
    | Types.InputMaybe<Types.TravelProductConfigInput>
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

export type InsuranceDestinationAddMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  code: Types.Scalars['String']['input'];
}>;

export type InsuranceDestinationAddMutation = {
  __typename?: 'Mutation';
  insuranceDestinationAdd?: {
    __typename?: 'TravelDestination';
    _id: string;
  } | null;
};

export type InsuranceDestinationEditMutationVariables = Types.Exact<{
  _id: Types.Scalars['ID']['input'];
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
  code?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type InsuranceDestinationEditMutation = {
  __typename?: 'Mutation';
  insuranceDestinationEdit?: {
    __typename?: 'TravelDestination';
    _id: string;
  } | null;
};

export type InsuranceDestinationRemoveMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;

export type InsuranceDestinationRemoveMutation = {
  __typename?: 'Mutation';
  insuranceDestinationRemove?: string | null;
};
