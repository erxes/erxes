export interface IIntegration {
  _id: string;
  name: string;
  kind: string;
  channelId: string;
}

export interface IIntegrationDetail extends IIntegration {
  languageCode?: string;
  code?: string;
  tagIds?: string[];
  createdAt?: string;
  leadData?: string;
  messengerData?: string;
  uiOptions?: string;
  isConnected?: boolean;
  departmentIds?: string[];
  details?: any;
  callData?: any;
  isActive: boolean;
  healthStatus: {
    status: 'healthy' | string;
  };
}

export interface IIntegrationType {
  _id: string;
  name: string;
}
