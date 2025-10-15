import { TablerIcon } from '@tabler/icons-react';

export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
}

export interface IIntegrationItem {
  img: string;
  label: string;
  description: string;
  steps: {
    id: number;
    name: string;
    description: string;
    isFinal: boolean;
    isEmpty?: {
      name: string;
      description: string;
    };
    Icon?: TablerIcon;
  }[];
}
export interface IIntegrationContext {
  integrations: Record<string, IIntegrationItem>;
  otherIntegrations: Record<string, IIntegrationItem>;
  setIntegrations: (integrations: Record<string, IIntegrationItem>) => void;
  setOtherIntegrations: (
    integrations: Record<string, IIntegrationItem>,
  ) => void;
  selectedIntegrationType?: string;
  setSelectedIntegrationType?: (kind: string) => void;
}

export interface IBrand {
  _id: string;
  code: string;
  name: string;
}

export interface IIntegrationColumnDef {
  _id: string;
  name: string;
  kind: string;
  isActive: boolean;
  healthStatus: {
    status: 'healthy' | 'page-token' | 'account-token';
  };
}
