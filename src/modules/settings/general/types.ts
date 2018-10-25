export interface ICurrencies {
  _id: string;
  code: string;
  value: string[];
}

// query types

export type ConfigDetailQueryResponse = {
  configsDetail: ICurrencies;
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type InsertConfigMutationVariables = {
  code: string;
  value: string;
};

export type InsertConfigMutationResponse = {
  insertConfig: (
    params: { variables: InsertConfigMutationVariables }
  ) => Promise<any>;
};
