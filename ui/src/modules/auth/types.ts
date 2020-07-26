import { IBrand } from 'modules/settings/brands/types';
import { IEmailSignature } from 'modules/settings/email/types';

export interface IUserDetails {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  description?: string;
  position?: string;
  location?: string;
  operatorPhone?: string;
}

export interface IUserLinks {
  facebook?: string;
  twitter?: string;
  linkedIn?: string;
  youtube?: string;
  github?: string;
  website?: string;
}

export interface IUserConversation {
  list: any[];
  totalCount: number;
}

export interface IUserDoc {
  createdAt?: Date;
  username: string;
  email: string;
  isActive?: boolean;
  details?: IUserDetails;
  isOwner?: boolean;
  status?: string;
  links?: IUserLinks;
  getNotificationByEmail?: boolean;
  participatedConversations?: IUserConversation[];
  permissionActions?: string[];
  configs?: any;
  configsConstants?: any;
}

export interface IUser extends IUserDoc {
  _id: string;
  brands?: IBrand[];
  emailSignatures?: IEmailSignature[];
}

export type ForgotPasswordMutationVariables = {
  email: string;
  callback: (e: Error) => void;
};

export type ForgotPasswordMutationResponse = {
  forgotPasswordMutation: (
    params: {
      variables: ForgotPasswordMutationVariables;
    }
  ) => Promise<any>;
};

export type ResetPasswordMutationVariables = {
  newPassword: string;
  token: string;
};

export type ResetPasswordMutationResponse = {
  resetPasswordMutation: (
    params: { variables: ResetPasswordMutationVariables }
  ) => Promise<any>;
};

export type LoginMutationVariables = {
  email: string;
  password: string;
};

export type LoginMutationResponse = {
  loginMutation: (
    params: {
      variables: LoginMutationVariables;
    }
  ) => Promise<any>;
};

export type CurrentUserQueryResponse = {
  currentUser: IUser;
  loading: boolean;
};
