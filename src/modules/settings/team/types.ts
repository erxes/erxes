import { IActivityLogForMonth } from '../../activityLogs/types';
import { IUser, IUserDoc } from '../../auth/types';
import { IConversation } from '../../inbox/types';

export type UsersQueryResponse = {
  users: IUser[];
  loading: boolean;
  refetch: () => void;
};

export type UserDetailQueryResponse = {
  userDetail: IUser;
  loading: boolean;
  refetch: () => void;
};

export type EditMutationResponse = {
  usersEdit: (
    params: { variables: { _id: string } & IUserDoc }
  ) => Promise<any>;
};

export type ActivityLogQueryResponse = {
  activityLogsUser: IActivityLogForMonth[];
  loading: boolean;
};

export type UserConverationsQueryResponse = {
  userConversations: {
    list: IConversation[];
    totalCount: number;
  };
  loading: boolean;
  refetch: () => void;
};

export type ConfirmMutationVariables = {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
  fullName: string;
  username: string;
};

export type ConfirmMutationResponse = {
  usersConfirmInvitation: (
    params: { variables: ConfirmMutationVariables }
  ) => Promise<any>;
};
