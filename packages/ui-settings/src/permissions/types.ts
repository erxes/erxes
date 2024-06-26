import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

export interface IUserGroup {
  _id: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  members?: IUser[];
  branchIds: string[];
  branches?: IBranch[];
  departmentIds?: string[];
  departmens?: IDepartment[];
}

export type UsersGroupsQueryResponse = {
  usersGroups: IUserGroup[];
  loading: boolean;
};
