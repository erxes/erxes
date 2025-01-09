// queries
export interface IList {
  _id: string;
  type?: string;
  contantType?: string;
  createdAt?: Date;
  createdBy?: string;
  contentId?: string;
  consumeData: any;
  consumeStr: any;
  sendData: any;
  sendStr: any;
  header: string;
  responseData: any;
  responseStr: any;
  error: string;
  content: string;
  createdUser: any;
}

// mutations

export type ListResponce = {
  syncHistoriesPolaris: any;
  refetch: () => void;
  loading: boolean;
};

export type TotalCountQueryResponse = {
  syncHistoriesCountPolaris: number;
} & QueryResponse;

export type QueryResponse = {
  loading: boolean;
  refetch: (variables?: any) => Promise<any>;
  error?: string;
};

export type SyncHistoriesQueryResponse = {
  syncHistoriesPolaris: any[];
  loading: boolean;
  refetch: () => void;
};

export type SyncHistoriesCountQueryResponse = {
  syncHistoriesCountPolaris: number;
  loading: boolean;
  refetch: () => void;
};

export type ToCheckMutationResponse = {
  toCheckPolaris: (mutation: { variables: { type: string } }) => Promise<any>;
};

export type ToSyncMutationResponse = {
  toSyncPolaris: (mutation: {
    variables: { type: string; items: any[] };
  }) => Promise<any>;
};
