export type IConfigsMap = {[key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
}

// query types
export type ConfigsQueryResponse = {
  configs: IConfig[];
  loading: boolean;
  refetch: () => void;
};