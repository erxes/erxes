export type StatusType = 'success' | 'failed';
export type SourceType = 'graphql' | 'mongo' | 'auth' | 'webhook';

export type IJobData = {
  subdomain: string;
  source: SourceType;
  status: StatusType;
  action: string;
  contentType?: string;
  payload: any;
  userId?: string;
  processId?: string;
};

export type AfterProcessProps = {
  source: SourceType;
  action: string;
  payload: any;
  contentType?: string;
};
