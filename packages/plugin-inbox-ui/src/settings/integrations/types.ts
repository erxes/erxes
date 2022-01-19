import { QueryResponse } from '@erxes/ui/src/types';
import {
  IIntegration,
  ITopic,
  IUiOptions,
  QueryVariables,
  IMessengerData
} from '@erxes/ui-settings/src/integrations/types';

export interface IPages {
  id: string;
  name?: string;
  checked?: boolean;
  isUsed?: boolean;
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

export interface IWebsite {
  url: string;
  buttonText: string;
  description: string;
}

export interface ILead {
  formCode: string;
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

export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

// query types
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

export type MessengerAppsQueryResponse = {
  messengerApps: IMessengerApps;
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

export type SaveMessengerMutationResponse = {
  saveMessengerMutation: (params: {
    variables: SaveMessengerMutationVariables;
  }) => Promise<any>;
};

export type SaveMessengerAppearanceMutationResponse = {
  saveAppearanceMutation: (params: {
    variables: { _id: string; uiOptions: IUiOptions };
  }) => Promise<any>;
};

export type SaveMessengerAppsMutationResponse = {
  messengerAppSaveMutation: (params: {
    variables: { integrationId: string; messengerApps: IMessengerApps };
  }) => Promise<any>;
};

export type SaveMessengerConfigsMutationResponse = {
  saveConfigsMutation: (params: {
    variables: { _id: string; messengerData: IMessengerData };
  }) => any;
};

export type EditMessengerMutationVariables = {
  _id: string;
  name: string;
  brandId: string;
  languageCode: string;
  channelIds?: string[];
};

export type EditMessengerMutationResponse = {
  editMessengerMutation: (params: {
    variables: EditMessengerMutationVariables;
  }) => any;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type RepairMutationResponse = {
  repairIntegration: (params: { variables: { _id: string } }) => Promise<any>;
};

export type RemoveAccountMutationResponse = {
  removeAccount: (params: { variables: { _id: string } }) => Promise<any>;
};

export type CommonFieldsEditResponse = {
  editCommonFields: (params: {
    variables: {
      _id: string;
      name: string;
      brandId: string;
      channelIds?: string[];
      data: any;
    };
  }) => Promise<any>;
};
