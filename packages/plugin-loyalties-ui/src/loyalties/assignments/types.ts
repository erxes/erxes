import { IUser } from '@erxes/ui/src/auth/types';
import { ICommonDoc } from '../common/types';

export interface IAssignmentDoc extends ICommonDoc {
  segmentIds?: string[];
}

export interface IAssignment extends IAssignmentDoc {
  _id: string;
  owner: IUser;
}

// mutation types
export type AddMutationResponse = {
  assignmentsAdd: (params: { variables: IAssignmentDoc }) => Promise<any>;
};

export type EditMutationResponse = {
  assignmentsEdit: (params: { variables: IAssignment }) => Promise<any>;
};

export type RemoveMutationVariables = {
  _ids: string[];
};

export type RemoveMutationResponse = {
  assignmentsRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

// query types
export type MainQueryResponse = {
  assignmentsMain: { list: IAssignment[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type AssignmentsQueryResponse = {
  assignments: IAssignment[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  lotteryDetail: IAssignment;
  loading: boolean;
};
