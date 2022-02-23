import { IUser } from '@erxes/ui/src/auth/types';

export interface IUserGroup {
  _id: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  members?: IUser[];
}

export type UsersGroupsQueryResponse = {
  usersGroups: IUserGroup[];
  loading: boolean;
};
