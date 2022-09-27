export interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

export interface IQueryParams {
  amount: number;
  description: string;
  customerId: string;
  companyId: string;
  contentType: string;
  contentTypeId: string;
}


export type QueryResponse = {
  loading: boolean;
  refetch: () => Promise<any>;
  error?: string;
};

// export type ActivityLogQueryResponse = {
//   activityLogs: IActivityLog[];
//   subscribeToMore: any;
// } & QueryResponse;