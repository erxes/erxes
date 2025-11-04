import { IChannel } from '@/channels/types';

export interface IIntegration {
  _id: string;
  name: string;
  kind: string;
  channelId: string;
  channel: any;
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
  channel: IChannel;
}

export interface IIntegrationType {
  _id: string;
  name: string;
}
