import { IForm, IFormIntegration } from 'modules/forms/types';
import { IBrand } from '../brands/types';
import { IChannel } from '../channels/types';

export interface IGoogleCredentials {
  access_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface IMessengerApp {
  _id: string;
  name: string;
}

export interface ILink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface IFacebookApp {
  id: string;
  name: string;
}

export interface IPages {
  id: string;
  name?: string;
  checked?: boolean;
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
  onlineHours?: IOnlineHour[];
  links?: ILink;
}

export interface IUiOptions {
  color?: string;
  wallpaper?: string;
  logo?: string;
  logoPreviewUrl?: string;
}

export interface IFormData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankContent?: string;
  redirectUrl?: string;
}

export interface ITwitterData {
  info?: any;
  token?: string;
  tokenSecret?: string;
}

export interface IFacebookData {
  appId: string;
  pageIds: string[];
}

export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  brandId?: string;
  description?: string;
  code: string;
  formId: string;
  form: IForm;
  logo: string;
  languageCode?: string;
  createUrl: string;
  createModal: string;
  messengerData?: IMessengerData;
  facebookData?: IFacebookData;
  uiOptions?: IUiOptions;
  formData?: IFormData;
  brand: IBrand;
  channels: IChannel[];
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

export type IntegrationsQueryResponse = {
  integrations: IIntegration[];
  loading: boolean;
  refetch: (variables?: QueryVariables) => void;
};

export type LeadsQueryResponse = {
  forms: IForm[];
  loading: boolean;
  refetch: (variables?: QueryVariables) => void;
};

export type IntegrationDetailQueryResponse = {
  integrationDetail: IIntegration;
  loading: boolean;
  refetch: () => void;
};

export type FacebookAppsListQueryResponse = {
  integrationFacebookAppsList: IFacebookApp[];
  refetch: () => void;
  loading: boolean;
};

type By = { [key: string]: number };

export type ByKind = {
  messenger: number;
  form: number;
  twitter: number;
  facebook: number;
  gmail: number;
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

export type MessengerAppsCountQueryResponse = {
  messengerAppsCount: number;
  loading: boolean;
};

export type FormIntegrationDetailQueryResponse = {
  integrationDetail: IFormIntegration;
  loading: boolean;
  refetch: () => void;
};

export type GetGoogleAuthUrlQueryResponse = {
  integrationGetGoogleAuthUrl: string;
  loading: boolean;
  refetch: () => void;
};

export type GetGoogleAccessTokenQueryResponse = {
  integrationGetGoogleAccessToken: string;
  loading: boolean;
  refetch: () => void;
};

export type GetTwitterAuthUrlQueryResponse = {
  integrationGetTwitterAuthUrl: string;
  loading: boolean;
  refetch: () => void;
};

export type GoogleAccessTokenQueryResponse = {
  integrationGetGoogleAccessToken: IGoogleCredentials;
  loading: boolean;
  refetch: () => void;
};

export type AccountsQueryResponse = {
  accounts: IAccount[];
  loading: boolean;
  refetch: () => void;
};

export interface IGmailAttachment {
  filename?: string;
  mimeType?: string;
  size?: number;
  data?: string;
}

// mutation types
export type SaveMessengerMutationVariables = {
  name: string;
  brandId: string;
  languageCode: string;
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
  ) => void;
};

export type SaveMessengerConfigsMutationResponse = {
  saveConfigsMutation: (
    params: { variables: { _id: string; messengerData: IMessengerData } }
  ) => any;
};

export type TwitterAuthParams = {
  oauth_token: string;
  oauth_verifier: string;
};

export type GmailAuthParams = {
  code: string;
};

export type SaveTwitterMutationResponse = {
  saveMutation: (
    params: { variables: { brandId: string; accountId: string } }
  ) => Promise<any>;
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

export type CreateGmailMutationVariables = {
  name: string;
  brandId: string;
  accountId: string;
};

export type CreateGmailMutationResponse = {
  saveMutation: (
    params: {
      variables: CreateGmailMutationVariables;
    }
  ) => Promise<any>;
};

export type SendGmailMutationVariables = {
  cc?: string;
  bcc?: string;
  toEmails?: string;
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

export type CreateFacebookMutationVariables = {
  name: string;
  brandId: string;
  pageIds: string[];
};

export type MessengerAppsAddGoogleMeetMutationVariables = {
  name: string;
  accountId: string;
};

export type messengerAppsAddGoogleMeetMutationResponse = {
  saveMutation: (
    params: { variables: MessengerAppsAddGoogleMeetMutationVariables }
  ) => Promise<any>;
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

export type messengerAppsAddKnowledgebaseMutationResponse = {
  saveMutation: (
    params: { variables: messengerAppsAddKnowledgebaseVariables }
  ) => Promise<any>;
};

export type CreateFacebookMutationResponse = {
  saveMutation: (
    params: {
      variables: CreateFacebookMutationVariables & { accountId: string };
    }
  ) => Promise<any>;
};

export type AddIntegrationMutationVariables = {
  formData: IFormData;
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
  formData: IFormData;
  brandId: string;
  name: string;
  languageCode: string;
  formId: string;
};

export type LinkTwitterMutationResponse = {
  accountsAddTwitter: (
    { queryParams }: { queryParams: TwitterAuthParams }
  ) => Promise<any>;
};

export type LinkGmailMutationResponse = {
  accountsAddGmail: (params: { variables: { code: string } }) => Promise<any>;
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
