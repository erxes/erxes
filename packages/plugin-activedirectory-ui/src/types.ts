export type IConfig = {
  _id?: string;
  apiUrl: string;
  isLocalUser: boolean;
  userDN: string;
  baseDN: string;
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

export type ToCheckUsersMutationResponse = {
  toCheckAdUsers: (mutation: {
    variables: { userName: string; userPass: string };
  }) => Promise<any>;
};

export type ToSyncUsersMutationResponse = {
  toSyncAdUsers: (mutation: {
    variables: { action: string; users: any[] };
  }) => Promise<any>;
};
