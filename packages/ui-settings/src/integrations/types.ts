import { QueryResponse } from '@erxes/ui/src/types';
import {
  ILeadData,
  ILeadIntegration,
  IWebhookData
} from '@erxes/ui-leads/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IForm } from '@erxes/ui-forms/src/forms/types';
import { IChannel } from '../channels/types';
import { IProductCategory } from '@erxes/ui-products/src/types';

export interface IMessengerApp {
  _id: string;
  name: string;
}

export interface IStyle {
  itemShape?: string;
  widgetColor: string;
  productAvailable: string;
  line?: string;
  columns?: number;
  rows?: number;
  margin?: number;
  baseFont?: string;
}

export interface IBookingData {
  name?: string;
  image?: any;
  description?: string;
  userFilters?: string[];
  productCategoryId?: string;
  style?: IStyle;
  mainProductCategory?: IProductCategory;
  navigationText?: string;
  bookingFormText?: string;

  viewCount?: number;
  productFieldIds?: string[];
}

export interface ILink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface IOnlineHour {
  _id: string;
  day: string;
  from: string;
  to: string;
}

export interface IMessagesItem {
  greetings: { title?: string; message?: string };
  away?: string;
  thank?: string;
  welcome?: string;
}

export interface IMessages {
  [key: string]: IMessagesItem;
}

export interface ISkillData {
  typeId: string;
  options: Array<{
    label: string;
    response: string;
    skillId: string;
  }>;
}

export interface IMessengerData {
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  skillData?: ISkillData;
  messages?: IMessages;
  notifyCustomer?: boolean;
  supporterIds?: string[];
  availabilityMethod?: string;
  isOnline?: boolean;
  timezone?: string;
  responseRate?: string;
  showTimezone?: boolean;
  requireAuth?: boolean;
  showChat?: boolean;
  showLauncher?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
  onlineHours?: IOnlineHour[];
  links?: ILink;
}

export interface IUiOptions {
  color?: string;
  textColor?: string;
  wallpaper?: string;
  logo?: string;
  logoPreviewUrl?: string;
}

export interface ITopic {
  topicId: string;
}

export interface ITopicMessengerApp {
  credentials: ITopic;
}

export interface IWebsite {
  url: string;
  buttonText: string;
  description: string;
}

export interface IWebsiteMessengerApp {
  credentials: IWebsite;
}

export interface ILead {
  formCode: string;
}

export interface ILeadMessengerApp {
  credentials: ILead;
}

interface IIntegartionHealthStatus {
  status: string;
  error: string;
}

export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  brandId?: string;
  code: string;
  formId: string;
  languageCode?: string;
  createUrl: string;
  createModal: string;
  messengerData?: IMessengerData;
  form: IForm;
  uiOptions?: IUiOptions;
  leadData: ILeadData;
  brand: IBrand;
  channels: IChannel[];
  isActive?: boolean;
  healthStatus?: IIntegartionHealthStatus;
  webhookData?: IWebhookData;
  leadMessengerApps?: ILeadMessengerApp[];
  websiteMessengerApps?: IWebsiteMessengerApp[];
  knowledgeBaseMessengerApps?: ITopicMessengerApp[];
  bookingData?: IBookingData;
  visibility?: string;
  departmentIds?: string[];
}

export type QueryVariables = {
  page?: number;
  perPage?: number;
  searchValue?: string;
};

export type IntegrationsQueryResponse = {
  integrations: IIntegration[];
  loading: boolean;
  refetch: (variables?: QueryVariables) => Promise<any>;
};

export type ArchiveIntegrationResponse = {
  archiveIntegration: (params: {
    variables: { _id: string; status: boolean };
  }) => Promise<any>;
};

export type IntegrationMutationVariables = {
  brandId: string;
  name: string;
  channelIds?: string[];
  data?: any;
};

export type AddIntegrationMutationVariables = {
  leadData: ILeadData;
  languageCode: string;
  formId: string;
} & IntegrationMutationVariables;

export type AddIntegrationMutationResponse = {
  addIntegrationMutation: (params: {
    variables: AddIntegrationMutationVariables;
  }) => Promise<any>;
};

export type EditIntegrationMutationVariables = {
  _id: string;
  leadData: ILeadData;
  languageCode: string;
  formId: string;
} & IntegrationMutationVariables;

export type EditIntegrationMutationResponse = {
  editIntegrationMutation: (params: {
    variables: EditIntegrationMutationVariables;
  }) => Promise<void>;
};

export type LeadIntegrationDetailQueryResponse = {
  integrationDetail: ILeadIntegration;
} & QueryResponse;

export type SendSmsMutationResponse = ({
  variables: SendSmsMutationVariables
}) => Promise<any>;

type By = { [key: string]: number };

export type ByKindTotalCount = {
  messenger: number;
  lead: number;
  facebook: number;
  gmail: number;
  callpro: number;
  chatfuel: number;
  imap: number;
  office365: number;
  outlook: number;
  yahoo: number;
  telegram: number;
  viber: number;
  line: number;
  twilio: number;
  whatsapp: number;
};

type IntegrationsCount = {
  total: number;
  byTag: By;
  byChannel: By;
  byBrand: By;
  byKind: ByKindTotalCount;
};

export type IntegrationsCountQueryResponse = {
  integrationsTotalCount: IntegrationsCount;
  loading: boolean;
};
