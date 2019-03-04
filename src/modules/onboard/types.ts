import { UserMutationVariables } from 'modules/settings/team/types';

// queries
export type UsersCountQueryResponse = {
  usersTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

// mutations
export type UsersAddMutationResponse = {
  addMutation: (
    params: {
      variables: UserMutationVariables;
    }
  ) => Promise<void>;
};

export type UserRemoveMutationVariables = {
  _id: string;
};

export type UserRemoveMutationResponse = {
  removeMutation: (
    params: {
      variables: UserRemoveMutationVariables;
    }
  ) => Promise<void>;
};

export type UserSeenOnboardMutationResponse = {
  userSeenOnboardMutation: () => Promise<void>;
};
export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  languageCode?: string;
}

export type IntegrationsQueryResponse = {
  integrations: IIntegration[];
  loading: boolean;
};
