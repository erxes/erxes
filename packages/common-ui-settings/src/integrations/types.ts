// import { IBookingData } from 'modules/bookings/types';
import { QueryResponse } from '@erxes/ui/src/types';
// import { IForm } from 'modules/forms/types';
import { ILeadData, ILeadIntegration } from '@erxes/ui/src/leads/types';
import { IBrand } from '@erxes/ui/src/brands/types';
// import { IChannel } from '../channels/types';

export interface IMessengerApp {
  _id: string;
  name: string;
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
  form: any; // IForm;
  uiOptions?: IUiOptions;
  leadData: any; // ILeadData;
  brand: IBrand;
  channels: any[]; // IChannel[];
  isActive?: boolean;
  healthStatus?: any[]; // IIntegartionHealthStatus;
  webhookData?: any[]; // IWebhookData;
  leadMessengerApps?: any[]; // ILeadMessengerApp[];
  websiteMessengerApps?: any[]; // IWebsiteMessengerApp[];
  knowledgeBaseMessengerApps?: ITopicMessengerApp[];
  bookingData?: any; // IBookingData;
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
