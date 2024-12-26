export type IConfig = {
  _id?: string;
  apiUrl: string;
  localUser: boolean;
  userDN: string;
  adminDN?: string;
  adminPassword?: string;
  code: string;
};

// mutation types

export type ConfigsQueryResponse = {
  adConfigs: IConfig;
  loading: boolean;
  refetch: () => void;
};
