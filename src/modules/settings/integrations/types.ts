import { IForm, IFormIntegration } from 'modules/forms/types';
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

type By = { [key: string]: number };

export type ByKind = {
  messenger: number;
  form: number;
  facebook: number;
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
