export type MSDynamicSyncHistoryUser = {
  _id: string;
  email?: string;
  details?: {
    fullName?: string;
  };
};

export interface IMSDynamicSyncHistory {
  _id: string;
  type: string;
  contentType: string;
  contentId: string;
  createdAt: Date;
  createdBy: string;
  consumeData: unknown;
  consumeStr: string;
  sendData: unknown;
  sendStr: string;
  responseData: unknown;
  responseStr: string;
  error: string;
  createdUser?: MSDynamicSyncHistoryUser;
  content: string;
}
