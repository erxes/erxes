import {
  IUser as IUserC,
  IUserConversation as IUserConversationC,
  IUserDetails as IUserDetailsC,
  IUserDoc as IUserDocC,
  IUserLinks as IUserLinksC
} from '@erxes/ui/src/auth/types';

export type IUser = IUserC & { isSubscribed?: boolean } & {
  isShowNotification?: boolean;
} & {
  customFieldsData?: {
    [key: string]: any;
  };
};
export type IUserDetails = IUserDetailsC;
export type IUserLinks = IUserLinksC;
export type IUserConversation = IUserConversationC;
export type IUserDoc = IUserDocC;

export interface IOwner {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  purpose: string;
  subscribeEmail?: boolean;
}

export type LoginMutationVariables = {
  email: string;
  password: string;
};

export type LoginMutationResponse = {
  loginMutation: (params: {
    variables: LoginMutationVariables;
  }) => Promise<any>;
};

export type CurrentUserQueryResponse = {
  posCurrentUser: IUser;
  loading: boolean;
  subscribeToMore: any;
  refetch: () => void;
};

export type FetchConfigsMutationResponse = {
  fetchConfigsMutation: ({ variables: { token } }) => Promise<any>;
};
