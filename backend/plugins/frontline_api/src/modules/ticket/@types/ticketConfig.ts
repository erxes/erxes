import { Document } from 'mongoose';

export interface ITicketFormFields {
  name?: {
    isShow?: boolean;
    label?: string;
    placeholder?: string;
    order?: number;
  };
  description: {
    isShow?: boolean;
    label?: string;
    placeholder?: string;
    order?: number;
  };
  attachment: {
    isShow?: boolean;
    label?: string;
    placeholder?: string;
    order?: number;
  };
  tags: {
    isShow?: boolean;
    label?: string;
    placeholder?: string;
    order?: number;
  };
}

export interface ITicketConfig {
  name: string;

  pipelineId: string;
  channelId: string;
  selectedStatusId: string;

  parentId?: string;

  formFields: ITicketFormFields;
}
export interface ITicketSaveConfigArgs {
  input: ITicketConfig;
}

export interface ITicketConfigUpdate extends ITicketConfig {
  _id: string;
}

export interface ITicketConfigDocument extends ITicketConfig, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
