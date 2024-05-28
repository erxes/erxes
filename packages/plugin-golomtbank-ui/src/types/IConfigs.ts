// queries
export type IConfigsMap = { [key: string]: any };

export type IBurenConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ConfigsResponse = {
  configs: IBurenConfig[];
  loading: boolean;
  refetch: () => void;
};