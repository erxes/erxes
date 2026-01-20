export type IInstagramBotPersistentMenu = {
    _id: string;
    text: string;
    type: 'button' | 'link';
    link: string;
  };
  
  export type IInstagramBot = {
    _id: string;
    name: string;
    account: any;
    accountId: string;
    createdAt: string;
    page: any;
    pageId: string;
    profileUrl: string;
    persistentMenus: IInstagramBotPersistentMenu[];
    greetText: string;
    tag: 'CONFIRMED_EVENT_UPDATE' | 'POST_PURCHASE_UPDATE' | 'ACCOUNT_UPDATE';
    isEnabledBackBtn: boolean;
    backButtonText: string;
  };
  