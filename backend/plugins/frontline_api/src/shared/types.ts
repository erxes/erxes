export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  errorMessage?: string;
}

export interface CustomerData {
  _id: string;
  primaryEmail?: string;
  primaryPhone?: string;
}

export interface ConversationData {
  _id: string;
  integrationId: string;
  customerId: string;
  content?: string;
  assignedUserId?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IntegrationHealth {
  status: 'healthy' | 'unHealthy';
  error?: string;
}

export type ActionHandler<T = any> = (
  subdomain: string,
  data: T,
) => Promise<ApiResponse>;

export interface MessageActionPayload {
  action: string;
  payload: any;
  metaInfo?: string;
}
