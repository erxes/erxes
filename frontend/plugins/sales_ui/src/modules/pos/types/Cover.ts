import { IUser } from 'ui-modules';

export interface ICover {
  _id: string;
  name: string;
  icon: string;
  isOnline: boolean;
  onServer: boolean;
  branchTitle: string;
  departmentTitle: string;
  createdAt: string;
  createdBy: string;
  user: IUser;
}
