import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { QueryResponse } from '@erxes/ui/src/types';

// query types

export interface IWork {
  processId?: string;
  name?: string;
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  type: string;
  typeId: string;
  flowId?: string;
  origin: string;
  count: number;
  intervalId?: string;
  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
  needProducts?: any[];
  resultProducts?: any[];
}

export interface IWorkDocument extends IWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;

  inBranch?: IBranch;
  inDepartment?: IDepartment;
  outBranch?: IBranch;
  outDepartment?: IDepartment;
  interval: any;
  flow: any;
}

export type WorksQueryResponse = {
  works: IWork[];
} & QueryResponse;

export type WorksTotalCountQueryResponse = {
  worksTotalCount: number;
} & QueryResponse;

export type WorkAddMutationResponse = {
  workAdd: (mutation: { variables: IWork }) => Promise<any>;
};

export type WorkEditMutationResponse = {
  workEdit: (mutation: { variables: IWork & { _id: string } }) => Promise<any>;
};

export type WorkRemoveMutationResponse = {
  workRemove: (mutation: { variables: { _id: string } }) => Promise<any>;
};
