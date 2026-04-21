export type IFacebookBotPersistentMenu = {
  _id: string;
  text: string;
  type: 'button' | 'link';
  link: string;
};

export type IFacebookBotHealth = {
  status?: 'healthy' | 'degraded' | 'broken' | 'syncing';
  isSubscribed?: boolean;
  isProfileSynced?: boolean;
  lastSyncedAt?: string;
  lastVerifiedAt?: string;
  lastError?: string;
};

export type IFacebookBotUser = {
  _id: string;
  username?: string;
  email?: string;
  details?: {
    fullName?: string;
    avatar?: string;
  };
};

export type IFacebookBot = {
  _id: string;
  name: string;
  account: any;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  createdUser?: IFacebookBotUser;
  updatedUser?: IFacebookBotUser;
  page: any;
  pageId: string;
  profileUrl: string;
  persistentMenus: IFacebookBotPersistentMenu[];
  greetText: string;
  tag: 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE';
  isEnabledBackBtn: boolean;
  backButtonText: string;
  health?: IFacebookBotHealth;
};
