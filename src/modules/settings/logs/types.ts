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
  extraDesc?: string;
  addedData: string;
  changedData: string;
  unchangedData: string;
  removedData: string;
}

export interface ILogList {
  logs: ILog[];
  totalCount: number;
}

export interface INameLabel {
  name: string;
  label: string;
}

type QueryResponse = {
  loading: boolean;
  error: Error;
};

export type LogsQueryResponse = {
  logs: ILogList;
} & QueryResponse;

export type SchemaLabelsQueryResponse = {
  getDbSchemaLabels: INameLabel[];
} & QueryResponse;
