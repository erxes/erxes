import { QueryResponse } from '@erxes/ui/src/types';

export interface IAppParams {
  name: string;
  userGroupId: string;
  expireDate?: Date;
}

export interface IAppEditParams extends IAppParams {
  _id: string;
}

export interface IApp extends IAppEditParams {
  isEnabled?: boolean;
  accessToken: string;
  createdAt: Date;

  userGroupName: string;
}

export type AppsAddMutationResponse = {
  appsAdd: (params: { variables: IAppParams }) => Promise<IApp>;
};

export type AppsEditMutationResponse = {
  appsEdit: (params: { variables: IAppEditParams }) => Promise<IApp>;
};

export type AppsRemoveMutationResponse = {
  appsRemove: (params: { variables: { _id: string } }) => Promise<string>;
};

export type AppsQueryResponse = {
  apps: IApp[];
} & QueryResponse;

export type AppsTotalCountQueryResponse = {
  appsTotalCount: number;
} & QueryResponse;
