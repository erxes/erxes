import { QueryResponse } from 'modules/common/types';
import { IForm } from 'modules/forms/types';
import { ILeadData, ILeadIntegration, IWebhookData } from 'modules/leads/types';
import { IBrand } from '../brands/types';
import { IChannel } from '../channels/types';

export interface IMessengerApp {
  _id: string;
  name: string;
}

export interface ILink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface IPages {
  id: string;
  name?: string;
  checked?: boolean;
}

export interface IImapForm {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
}

export interface IExchangeForm {
  email: string;
  password: string;
  host: number;
  username?: string;
}

export interface ISelectMessengerApps {
  brand: IBrand;
  label: string;
  value: string;
  form?: IForm;
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

export interface IMessengerData {
  messages?: IMessages;
  notifyCustomer?: boolean;
  supporterIds?: string[];
  availabilityMethod?: string;
  isOnline?: boolean;
  timezone?: string;
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

export interface IWebsite {
  url: string;
  buttonText: string;
  description: string;
}

export interface ILead {
  formCode: string;
}

export interface ITopicMessengerApp {
  credentials: ITopic;
}

export interface IWebsiteMessengerApp {
  credentials: IWebsite;
}

export interface ILeadMessengerApp {
  credentials: ILead;
}
export interface IMessengerApps {
  knowledgebases?: ITopic[];
  websites?: IWebsite[];
  leads?: ILead[];
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
  webhookData?: IWebhookData;
  leadMessengerApps?: ILeadMessengerApp[];
  websiteMessengerApps?: IWebsiteMessengerApp[];
  knowledgeBaseMessengerApps?: ITopicMessengerApp[];
}


export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

// query types
export type QueryVariables = {
  page?: number;
  perPage?: number;
  searchValue?: string;
};

export type IntegrationTypes =
  | 'facebook'
  | 'gmail'
  | 'nylas-gmail'
  | 'nylas-exchange'
  | 'nylas-imap'
  | 'nylas-office365'
  | 'nylas-outlook'
  | 'nylas-yahoo'
  | 'twitter'
  | 'smooch-telegram'
  | 'smooch-viber'
  | 'smooch-line'
  | 'smooch-twilio';

export type IntegrationsQueryResponse = {
  integrations: IIntegration[];
  loading: boolean;
  refetch: (variables?: QueryVariables) => Promise<any>;
};

export type IntegrationDetailQueryResponse = {
  integrationDetail: IIntegration;
} & QueryResponse;

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

export interface IGmailAttachment {
  filename?: string;
  mimeType?: string;
  size?: number;
  data?: string;
}

export type MessengerAppsCountQueryResponse = {
  messengerAppsCount: number;
  loading: boolean;
};

export type LeadIntegrationDetailQueryResponse = {
  integrationDetail: ILeadIntegration;
} & QueryResponse;

export type AccountsQueryResponse = {
  integrationsFetchApi: IAccount[];
  error?: Error;
} & QueryResponse;

// mutation types
export type SaveMessengerMutationVariables = {
  name: string;
  brandId: string;
  languageCode: string;
  channelIds?: string[];
};

export type CreateGmailMutationVariables = {
  name: string;
  brandId: string;
};

export type SendGmailMutationVariables = {
  cc?: string;
  bcc?: string;
  toEmails?: string;
  headerId?: string;
  threadId?: string;
  subject?: string;
  body: string;
  integrationId?: string;
};

export type SendGmailMutationResponse = {
  integrationsSendGmail: (
    params: {
      variables: SendGmailMutationVariables;
    }
  ) => Promise<any>;
};

export type SaveMessengerMutationResponse = {
  saveMessengerMutation: (
    params: {
      variables: SaveMessengerMutationVariables;
    }
  ) => Promise<any>;
};

export type SaveMessengerAppearanceMutationResponse = {
  saveAppearanceMutation: (
    params: { variables: { _id: string; uiOptions: IUiOptions } }
  ) => Promise<any>;
};

export type SaveMessengerAppsMutationResponse = {
  messengerAppSaveMutation: (
    params: { variables: { integrationId: string; messengerApps: IMessengerApps } }
  ) => Promise<any>;
};

export type SaveMessengerConfigsMutationResponse = {
  saveConfigsMutation: (
    params: { variables: { _id: string; messengerData: IMessengerData } }
  ) => any;
};

export type EditMessengerMutationVariables = {
  _id: string;
  name: string;
  brandId: string;
  languageCode: string;
  channelIds?: string[];
};

export type EditMessengerMutationResponse = {
  editMessengerMutation: (
    params: {
      variables: EditMessengerMutationVariables;
    }
  ) => any;
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
  addIntegrationMutation: (
    params: {
      variables: AddIntegrationMutationVariables;
    }
  ) => Promise<any>;
};

export type EditIntegrationMutationVariables = {
  _id: string;
  leadData: ILeadData;
  languageCode: string;
  formId: string;
} & IntegrationMutationVariables;

export type EditIntegrationMutationResponse = {
  editIntegrationMutation: (
    params: {
      variables: EditIntegrationMutationVariables;
    }
  ) => Promise<void>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type RemoveAccountMutationResponse = {
  removeAccount: (params: { variables: { _id: string } }) => Promise<any>;
};

export type ArchiveIntegrationResponse = {
  archiveIntegration: (
    params: { variables: { _id: string; status: boolean } }
  ) => Promise<any>;
};

export type CommonFieldsEditResponse = {
  editCommonFields: (
    params: {
      variables: {
        _id: string;
        name: string;
        brandId: string;
        channelIds?: string[];
        data: any;
      };
    }
  ) => Promise<any>;
};

export type ProviderFormInput = (
  key:
    | 'email'
    | 'password'
    | 'imapHost'
    | 'imapPort'
    | 'smtpHost'
    | 'smtpPort'
    | 'host'
    | 'username'
    | string,
  value: string | number
) => void;

export type SendSmsMutationVariables = {
  integrationId: string;
  content: string;
  to: string;
};

export type SendSmsMutationResponse = (
  { variables: SendSmsMutationVariables }
) => Promise<any>;
