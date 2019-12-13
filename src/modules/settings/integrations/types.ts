import { IForm } from 'modules/forms/types';
import { ILeadData, ILeadIntegration } from 'modules/leads/types';
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
  onlineHours?: IOnlineHour[];
  links?: ILink;
}

export interface IUiOptions {
  color?: string;
  wallpaper?: string;
  logo?: string;
  logoPreviewUrl?: string;
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
  | 'nylas-imap'
  | 'nylas-office365'
  | 'nylas-outlook'
  | 'nylas-yahoo'
  | 'twitter';

export type IntegrationsQueryResponse = {
  integrations: IIntegration[];
  loading: boolean;
  refetch: (variables?: QueryVariables) => void;
};

export type IntegrationDetailQueryResponse = {
  integrationDetail: IIntegration;
  loading: boolean;
  refetch: () => void;
};

type By = { [key: string]: number };

export type ByKind = {
  messenger: number;
  form: number;
  facebook: number;
  gmail: number;
  callpro: number;
  chatfuel: number;
  imap: number;
  office365: number;
  outlook: number;
  yahoo: number;
};

type IntegrationsCount = {
  total: number;
  byTag: By;
  byChannel: By;
  byBrand: By;
  byKind: ByKind;
};

export type IntegrationsCountQueryResponse = {
  integrationsTotalCount: IntegrationsCount;
  loading: boolean;
};

export interface IEngageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export type EngageConfigQueryResponse = {
  engagesConfigDetail: IEngageConfig;
  loading: boolean;
  refetch: () => void;
};

export type EngagesConfigSaveMutationResponse = {
  engagesConfigSave: (
    params: {
      variables: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
      };
    }
  ) => Promise<any>;
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
  loading: boolean;
  refetch: () => void;
};

export type AccountsQueryResponse = {
  integrationsFetchApi: IAccount[];
  loading: boolean;
  refetch: () => void;
  error?: Error;
};

// mutation types
export type SaveMessengerMutationVariables = {
  name: string;
  brandId: string;
  languageCode: string;
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
};

export type EditMessengerMutationResponse = {
  editMessengerMutation: (
    params: {
      variables: EditMessengerMutationVariables;
    }
  ) => any;
};

export type MessengerAppsAddLeadMutationVariables = {
  name: string;
  integrationId: string;
  formId: string;
};

export type MessengerAppsAddLeadMutationResponse = {
  saveMutation: (
    params: { variables: MessengerAppsAddLeadMutationVariables }
  ) => Promise<any>;
};

export type messengerAppsAddKnowledgebaseVariables = {
  name: string;
  integrationId: string;
  topicId: string;
};

export type MessengerAppsAddKnowledgebaseMutationResponse = {
  saveMutation: (
    params: { variables: messengerAppsAddKnowledgebaseVariables }
  ) => Promise<any>;
};

export type AddIntegrationMutationVariables = {
  leadData: ILeadData;
  brandId: string;
  name: string;
  languageCode: string;
  formId: string;
};

export type AddIntegrationMutationResponse = {
  addIntegrationMutation: (
    params: {
      variables: AddIntegrationMutationVariables;
    }
  ) => Promise<void>;
};

export type EditIntegrationMutationVariables = {
  _id: string;
  leadData: ILeadData;
  brandId: string;
  name: string;
  languageCode: string;
  formId: string;
};

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

export type MessengerAppsQueryResponse = {
  messengerApps: IMessengerApp[];
  loading: boolean;
  refetch: () => void;
};

export type MessengerAppsRemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type ArchiveIntegrationResponse = {
  archiveIntegration: (params: { variables: { _id: string } }) => Promise<any>;
};

export type CommonFieldsEditResponse = {
  editCommonFields: (
    params: { variables: { _id: string; name: string; brandId: string } }
  ) => Promise<any>;
};
