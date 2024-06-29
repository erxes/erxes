export type IConfigsMap = { [key: string]: any };

export type IAccountingsConfig = {
  _id: string;
  code: string;
  value: any;
};

// query types
export type AccountingsConfigsQueryResponse = {
  accountingsConfigs: IAccountingsConfig[];
  loading: boolean;
  refetch: () => void;
};
