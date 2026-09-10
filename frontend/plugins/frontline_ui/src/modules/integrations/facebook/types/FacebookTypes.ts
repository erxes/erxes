import { IMessage } from '@/inbox/types/Conversation';

export interface IFacebookConversationMessage extends IMessage {
  botData?: TBotData[];
  source?: IFacebookMessageRelationSource;
  relatedMessage?: IFacebookMessageRelation;
}

export interface IFacebookMessageRelationSource {
  type?: string;
  conversationId?: string;
  messageId?: string;
  commentId?: string;
  content?: string;
}

export interface IFacebookMessageRelation {
  conversationId?: string;
  messageId?: string;
  content?: string;
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

// Meta retired CONFIRMED_EVENT_UPDATE / POST_PURCHASE_UPDATE / ACCOUNT_UPDATE
// on 2026-04-27; sends using them fail with "Invalid parameter". HUMAN_AGENT
// is the only tag valid for inbox replies outside the 24-hour window.
export enum EnumFacebookTag {
  HUMAN_AGENT = 'HUMAN_AGENT',
}
