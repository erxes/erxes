// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type ConfigsQueryResponse = {
  loyaltyConfigs: IConfig[];
  loading: boolean;
  refetch: () => void;
};
