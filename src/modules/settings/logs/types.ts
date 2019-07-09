export interface ILog {
  _id: string;
  createdAt: Date;
  createdBy: string;
  type: string;
  action: string;
  oldData: string;
  newData: string;
  objectId: string;
  unicode: string;
  description: string;
}

export interface ILogList {
  logs: ILog[];
  totalCount: number;
}

export type LogsQueryResponse = {
  logs: ILogList;
  loading: boolean;
};
