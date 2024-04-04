import { QueryResponse } from '@erxes/ui/src/types';

export type OperationTypes = {
  _id: string;
  name: string;
  parentId: string;
  code?: string;
  order: string;
  parent?: any;
  createdAt?: string;
  modifiedAt?: string;
};

export type OperationsQueryResponse = {
  operations: OperationTypes[];
} & QueryResponse;

export type OperationsTotalCountQueryResponse = {
  operationsTotalCount: number;
} & QueryResponse;
export type RemoveOperationsMutationResponse = {
  removeOperations: (params: {
    variables: { ids: string[] };
  }) => Promise<OperationTypes>;
};
