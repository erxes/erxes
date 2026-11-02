export type TFacebookHistoryImportStatus =
  'queued' | 'running' | 'completed' | 'failed';

export interface IFacebookHistoryImport {
  status: TFacebookHistoryImportStatus;
  startedAt?: Date;
  finishedAt?: Date;
  conversations: number;
  messages: number;
  skippedConversations: number;
  error?: string;
}

export interface IFacebookIntegration {
  kind: string;
  accountId: string;
  emailScope?: string;
  erxesApiId: string;
  facebookPageIds?: string[];
  facebookPageTokensMap?: { [key: string]: string };
  email: string;
  expiration?: string;
  healthStatus?: string;
  error?: string;
  historyImport?: IFacebookHistoryImport;
}

export interface IFacebookIntegrationDocument
  extends IFacebookIntegration, Document {
  _id: string;
}

export interface IFacebookPageResponse {
  id: string;
  name: string;
}
