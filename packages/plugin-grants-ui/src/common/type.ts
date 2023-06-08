import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type IGrantRequest = {
  _id?: string;
  contentTypeId: string;
  contentType: string;
  userIds: string[];
  status: string;
  requesterId: string;
  users: { grantResponse: string } & IUser[];
  action: string;
  actionLabel?: string;
  params: string;
  detail?: {
    _id: string;
    name: string;
  };
  requester: IUser;
  createdAt: string;
  resolvedAt: string;
};

export type RequestQueryResponse = {
  grantRequest: IGrantRequest;
} & QueryResponse;

export type IGrantResponse = {
  _id: string;
  description: string;
  response: string;
  userId: string;
  createdAt: string;
  user: IUser;
};

export type RequestDetailQueryResponse = {
  grantRequestDetail: { responses: IGrantResponse[] } & IGrantRequest;
} & QueryResponse;

export type ConfigsQueryResponse = {
  grantConfigs: any[];
  grantConfigsTotalCount: number;
} & QueryResponse;
