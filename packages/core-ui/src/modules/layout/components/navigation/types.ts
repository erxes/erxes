import { QueryResponse } from "@erxes/ui/src/types";

export type GetEnvQueryResponse = {
  configsGetEnv: {
    RELEASE?: string;
    USE_BRAND_RESTRICTIONS?: string;
  };
} & QueryResponse;

export type ChildPlugin = {
  to: string;
  text: string;
  scope: string;
  permission?: string;
  permissions?: string[];
  additional: boolean;
};

export type Plugin = {
  text: string;
  url?: string;
  icon?: string;
  name?: string;
  permission?: string;
  permissions?: string[];
  children?: ChildPlugin[];
  label?: React.ReactNode;
  isPinned?: boolean;
  location?: string;
  action?: string;
  image?: string;
  to?: string;
  scope?: string;
};

type Integration = {
  name: string;
  description: string;
  isAvailable: boolean;
  inMessenger?: boolean;
  kind: string;
  logo: string;
  createModal: string;
  createUrl?: string;
  category?: string;
  components?: string[];
};

type Bots = {
  name: string;
  label: string;
  description: string;
  logo: string;
  list: string;
  createUrl: string;
};

type Base = {
  text?: string;
  url?: string;
  scope: string;
  module: string;
};

export type PluginConfig = {
  actionForms?: string;
  activityLog?: string;
  automation?: string;
  customNavigationLabel?: Base;
  exposes: {
    [key: string]: string;
  };
  integrationDetailsForm?: string;
  menus?: Plugin[];
  name: string;
  port: number;
  routes: Base;
  scope: string;
  srcDir: string;
  layout?: Base;
  inboxIntegrationForm?: string;
  invoiceDetailRightSection?: string;
  integrationCustomActions?: string;
  inboxIntegrationSettings?: string;
  inboxIntegrations?: Integration[];
  selectRelation?: string;
  customerRightSidebarSection?: string;
  companyRightSidebarSection?: string;
  dealRightSidebarSection?: string;
  cardDetailAction?: string;
  fieldConfig?: string;
  taskRightSidebarSection?: string;
  ticketRightSidebarSection?: string;
  contactDetailHeader?: string;
  inboxEditorAction?: string;
  videoCall?: string;
  inboxConversationDetailRespondBoxMask?: string;
  inboxConversationDetail?: string;
  relationForm?: string;
  segmentForm?: string;
  formPreview?: string;
  fieldPreview?: string;
  importExportUploadForm?: string;
  contactDetailLeftSidebar?: string;
  widget?: string;
  automationBots?: Bots[];
  inboxDirectMessage?: {
    messagesQuery: {
      query: string;
      name: string;
      integrationKind: string;
    };
    countQuery: {
      query: string;
      name: string;
      integrationKind: string;
    };
  };
  userRightSidebarSection?: Base[];
  selectPayments?: string;
  paymentConfig?: string;
  conversationDetailSidebar?: string;
  extendFormField?: string;
  extendFormFieldChoice?: string;
  propertyGroupForm?: string;
  contactDetailRightSidebar?: string;
  reportsCommonFormButton?: string;
  formsExtraFields?: {
    scope: string;
    component: string;
    type: string;
  }[];
  extendSystemConfig?: string;
  carRightSidebarSection?: string;
  template?: string;
};

export type Action = {
  name: string;
  text: string;
  icon: string;
  url: string;
  type?: string;
};

export type GeneralSetting = {
  name: string;
  text: string;
  icon: string;
  url: string;
};
