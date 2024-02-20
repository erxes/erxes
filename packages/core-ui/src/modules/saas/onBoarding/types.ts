import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import { IUserDoc } from 'modules/auth/types';

export type QueryVariables = {
  page?: number;
  perPage?: number;
  searchValue?: string;
};

export type IntegrationsQueryResponse = {
  integrations: IIntegration[];
  loading: boolean;
  refetch: (variables?: QueryVariables) => Promise<any>;
};

export type AddIntegrationMutationVariables = {
  brandName: string;
  languageCode?: string;
  color?: string;
  logo?: string;
};

export type AddIntegrationMutationResponse = {
  addIntegrationMutation: (params: {
    variables: AddIntegrationMutationVariables;
  }) => Promise<any>;
};

export type EditIntegrationMutationVariables = {
  _id: string;
  brandId?: string;
  brandName: string;
  languageCode?: string;
  color?: string;
  logo?: string;
};

export type EditIntegrationMutationResponse = {
  editIntegrationMutation: (params: {
    variables: EditIntegrationMutationVariables;
  }) => Promise<void>;
};

export type EditMutationResponse = {
  usersEdit: (params: {
    variables: { _id: string } & IUserDoc;
  }) => Promise<any>;
};

export type OnBoardingMutationResponse = {
  organizationOnboardingDone: (params: { variables: {} }) => Promise<any>;
};
