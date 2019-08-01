export interface IEngageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

// query types
export type EngageConfigQueryResponse = {
  engagesConfigDetail: IEngageConfig;
  loading: boolean;
  refetch: () => void;
};

// mutation types

export type EngagesConfigSaveMutationResponse = {
  engagesConfigSave: (
    params: {
      variables: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
      };
    }
  ) => Promise<any>;
};
