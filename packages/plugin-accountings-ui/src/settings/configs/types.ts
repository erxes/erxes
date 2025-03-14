export type IConfigsMap = { [key: string]: any };

export type IAccountingsConfig = {
  _id: string;
  code: string;
  value: any;
};

export type IRate = {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  date: Date;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
}

// query types
export type AccountingsConfigsQueryResponse = {
  accountingsConfigs: IAccountingsConfig[];
  loading: boolean;
  refetch: () => void;
};

export type AccountingsConfigsByCodeQueryResponse = {
  accountingsConfigsByCode: any;
  loading: boolean;
  refetch: () => void;
};

export type GetRateQueryResponse = {
  exchangeGetRate: IRate;
  loading: boolean;
  refetch: () => void;
};
