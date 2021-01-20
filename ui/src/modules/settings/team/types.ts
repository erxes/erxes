import { QueryResponse } from 'modules/common/types';
import { IActivityLogForMonth } from '../../activityLogs/types';
import { IUser, IUserDetails, IUserDoc, IUserLinks } from '../../auth/types';
import { IConversation } from '../../inbox/types';

export type IInvitationEntry = {
  email: string;
  password: string;
  groupId: string;
};

export type UserMutationVariables = {
  username: string;
  email: string;
  details?: IUserDetails;
  links?: IUserLinks;
  channelIds?: [string];
  password: string;
  passwordConfirmation: string;
};

export type UsersQueryResponse = {
  users: IUser[];
} & QueryResponse;

export type AllUsersQueryResponse = {
  allUsers: IUser[];
} & QueryResponse;

export type UserDetailQueryResponse = {
  userDetail: IUser;
} & QueryResponse;

export type EditMutationResponse = {
  usersEdit: (params: {
    variables: { _id: string } & IUserDoc;
  }) => Promise<any>;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export type UserConverationsQueryResponse = {
  userConversations: {
    list: IConversation[];
    totalCount: number;
  };
} & QueryResponse;

export type ConfirmMutationVariables = {
  token: string;
  password: string;
  passwordConfirmation: string;
  fullName: string;
  username: string;
};

export type ConfirmMutationResponse = {
  usersConfirmInvitation: (params: {
    variables: ConfirmMutationVariables;
  }) => Promise<any>;
};

export type ResetMemberPasswordResponse = {
  usersResetMemberPassword: (params: {
    variables: { _id: string; newPassword: string };
  }) => Promise<any>;
};
