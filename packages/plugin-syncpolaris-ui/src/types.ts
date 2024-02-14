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
  responseData: any;
  responseStr: any;
  error: string;
  content: string;
  createdUser: any;
}

// mutations

export type ListResponce = {
  syncHistories: any;
  refetch: () => void;
  loading: boolean;
};

export type TotalCountQueryResponse = {
  syncHistoriesCount: number;
} & QueryResponse;

export type QueryResponse = {
  loading: boolean;
  refetch: (variables?: any) => Promise<any>;
  error?: string;
};

export type SyncHistoriesQueryResponse = {
  syncHistories: any[];
  loading: boolean;
  refetch: () => void;
};

export type SyncHistoriesCountQueryResponse = {
  syncHistoriesCount: number;
  loading: boolean;
  refetch: () => void;
};
