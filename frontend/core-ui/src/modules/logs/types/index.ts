import { IPageInfo, IUser } from 'ui-modules';

export enum ILogSourceType {
  webhook = 'webhook',
  graphql = 'graphql',
  mongo = 'mongo',
  auth = 'auth',
}

export enum ILogStatusType {
  failed = 'failed',
  success = 'success',
}

export interface ILogDoc {
  _id: string;
  source: ILogSourceType;
  action: string;
  payload: any;
  userId?: string;
  user?: IUser;
  executionTime?: {
    startDate: Date;
    endDate: Date;
    durationMs: number;
  };
  createdAt: string;
  status?: ILogStatusType;
}
export type LogsMainListQueryResponse = {
  logsMainList: {
    list: ILogDoc[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
};

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type AvatarPopoverProps = {
  user?: any;
  size?: AvatarSize;
};
