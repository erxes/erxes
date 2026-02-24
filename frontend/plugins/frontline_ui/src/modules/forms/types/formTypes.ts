import { IChannel } from '@/channels/types';
import { IAttachment } from 'erxes-ui';

export interface IForm {
  _id: string;
  name: string;
  title: string;
  code: string;
  type: string;
  description: string;
  numberOfPages: number;
  status: string;
  buttonText: string;
  fields: IFormField[];
  leadData: ILeadData;
  channelId?: string;
  channel?: IChannel;
}

export interface ILeadData {
  appearance: string;
  thankTitle: string;
  thankContent: string;
  thankImage: IAttachment;
  primaryColor: string;
  successImage: string;
  steps: Record<string, { name: string; description: string; order: number }>;
}

export interface IFormField {
  _id: string;
  column: number;
  content: string;
  description: string;
  isRequired: boolean;
  options: string[];
  order: number;
  pageNumber: number;
  text: string;
  type: string;
  validation: string;
}

export interface IFormSetupPayload {
  title: string;
}

export enum FormsPageHotKeyScope {
  FormsPage = 'forms-page',
}
