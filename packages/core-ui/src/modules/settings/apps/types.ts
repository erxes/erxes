import { QueryResponse } from '@erxes/ui/src/types';

export interface IApp {
  _id: string;
  name: string;
  userGroupId: string;
  isEnabled?: boolean;
  accessToken: string;
  createdAt: Date;

  userGroupName: string;
}

interface IAppAddParams {
  name: string;
  userGroupId: string;
}

interface IAppEditParams extends IAppAddParams {
  _id: string;
}

export type AppsAddMutationResponse = {
  appsAdd: (params: { variables: IAppAddParams }) => Promise<IApp>;
}

export type AppsEditMutationResponse = {
  appsEdit: (params: { variables: IAppEditParams }) => Promise<IApp>;
}

export type AppsRemoveMutationResponse = {
  appsRemove: (params: { variables: { _id: string } }) => Promise<string>;
}

export type AppsQueryResponse = {
  apps: IApp[];
} & QueryResponse;

export type AppsTotalCountQueryResponse = {
  appsTotalCount: number;
} & QueryResponse;
