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
  consumeData: any;
  consumeStr: string;
  sendData: any;
  sendStr: string;
  responseData: any;
  responseStr: string;
  error: string;
  createdUser?: MSDynamicSyncHistoryUser;
  content: string;
}
