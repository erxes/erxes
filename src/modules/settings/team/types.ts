import { IUser } from '../../auth/types';

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
