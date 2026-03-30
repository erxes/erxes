import { IAttachment } from 'erxes-ui';

export interface IFacebookConversationMessage {
  _id: string;
  content: string;
  createdAt: string;
  attachments: IAttachment[];
  botData?: TBotData[];
  customerId?: string;
  userId?: string;
  internal?: boolean;
}

export interface IFacebookBotButton {
  title: string;
  url?: string;
  type?: string | null;
}

export interface IFacebookBotQuickReply {
  title: string;
}

export type TBotDataCarousel = {
  type: 'carousel';
  elements: {
    picture?: string;
    title: string;
    subtitle?: string;
    buttons: IFacebookBotButton[];
  }[];
};

export type TBotDataImage = {
  type: 'file';
  url: string;
};

export type TBotDataButtonTemplate = {
  type: 'button_template';
  text: string;
  buttons: IFacebookBotButton[];
};

export type TBotDataText = {
  type: 'text';
  text: string;
};

export type TBotDataQuickReplies = {
  type: 'quick_replies';
  text: string;
  quick_replies: IFacebookBotQuickReply[];
};

export type TBotData =
  | TBotDataCarousel
  | TBotDataImage
  | TBotDataButtonTemplate
  | TBotDataText
  | TBotDataQuickReplies;

export enum EnumFacebookTag {
  CONFIRMED_EVENT_UPDATE = 'CONFIRMED_EVENT_UPDATE',
  POST_PURCHASE_UPDATE = 'POST_PURCHASE_UPDATE',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
}
