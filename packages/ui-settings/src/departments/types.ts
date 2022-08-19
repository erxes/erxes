import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

interface IStructureCommon {
  _id: string;
  title: string;
  code: string;
  supervisorId: string;
  supervisor: IUser;
}

export interface IDepartment extends IStructureCommon {
  description: string;
  userIds: string[];
  users: IUser;
}

export type DepartmentsQueryResponse = {
  departments: IDepartment[];
} & QueryResponse;
