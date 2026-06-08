export type MSDynamicSyncHistoryUser = {
  email?: string;
  details?: {
    fullName?: string;
  };
};

export type MSDynamicSyncHistory = {
  _id: string;
  createdAt?: string;
  createdBy?: string;
  createdUser?: MSDynamicSyncHistoryUser;
  contentType?: string;
  content?: string;
  responseData?: unknown;
  responseStr?: string;
  error?: string;
};
