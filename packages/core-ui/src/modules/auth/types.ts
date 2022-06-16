import {
  IUser as IUserC,
  IUserConversation as IUserConversationC,
  IUserDetails as IUserDetailsC,
  IUserDoc as IUserDocC,
  IUserLinks as IUserLinksC
} from '@erxes/ui/src/auth/types';
import { IDepartment } from '@erxes/ui/src/team/types';

export type IUser = IUserC & {
  isSubscribed?: boolean;
  department?: IDepartment;
} & {
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

export type ForgotPasswordMutationVariables = {
  email: string;
  callback: (e: Error) => void;
};

export type ForgotPasswordMutationResponse = {
  forgotPasswordMutation: (params: {
    variables: ForgotPasswordMutationVariables;
  }) => Promise<any>;
};

export type ResetPasswordMutationVariables = {
  newPassword: string;
  token: string;
};

export type ResetPasswordMutationResponse = {
  resetPasswordMutation: (params: {
    variables: ResetPasswordMutationVariables;
  }) => Promise<any>;
};

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
  currentUser: IUser;
  loading: boolean;
};

export type CreateOwnerMutationResponse = {
  createOwnerMutation: (params: { variables: IOwner }) => Promise<any>;
};
