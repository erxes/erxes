import { IAttachment } from '@erxes/ui/src/types';

export type Button = {
  _id: string;
  text: string;
  link?: string;
};

export type PageTemplate = {
  _id: string;
  label: string;
  title?: string;
  description?: string;
  image?: IAttachment;
  buttons?: Button[];
};

export type Config = {
  messageTemplates?: PageTemplate[];
  text?: string;
  quickReplies?: any[];
  fromUserId: string;
};
