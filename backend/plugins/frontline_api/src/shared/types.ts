export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  errorMessage?: string;
}

export interface ImapMessage {
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  subject: string;
  body?: string;
  to?: Array<{ address: string; name?: string }>;
  cc?: Array<{ address: string; name?: string }>;
  bcc?: Array<{ address: string; name?: string }>;
  from?: Array<{ address: string; name?: string }>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  date: Date;
  html?: string;
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

export interface ListenResult {
  reconnect: boolean;
  error?: Error;
  result?: string;
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
