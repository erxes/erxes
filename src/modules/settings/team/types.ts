import { IActivityLogForMonth } from '../../activityLogs/types';
import { IUser, IUserDetails, IUserDoc, IUserLinks } from '../../auth/types';
import { IConversation } from '../../inbox/types';

export type IInvitationEntry = {
  email: string;
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
  activityLogs: IActivityLogForMonth[];
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
