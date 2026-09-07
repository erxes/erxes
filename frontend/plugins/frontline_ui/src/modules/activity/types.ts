import { IAttachment } from 'erxes-ui';
export interface IActivityFormField {
  label: string;
  value: unknown;
}

export interface IActivity {
  _id: string;
  module: string;
  action: string;
  contentId: string;
  metadata: {
    newValue: string;
    previousValue?: string;
    conversationId?: string;
    ticketId?: string;
    formId?: string;
    formTitle?: string;
    submissions?: IActivityFormField[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface INote {
  _id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  contentId: string;
  mentions: string[];
  attachments?: IAttachment[];
  updatedAt: string;
}

export interface INoteTemplateSuggestion {
  _id: string;
  name: string;
  content: string;
  channelId?: string;
  updatedAt?: string;
  preview?: string;
}

export interface INoteAttachment {
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
}
