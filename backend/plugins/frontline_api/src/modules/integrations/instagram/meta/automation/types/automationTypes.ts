import { IInstagramConversationMessage } from '@/integrations/instagram/@types/conversationMessages';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import {
  IAutomationAction,
  IAutomationExecution,
  IAutomationTrigger,
} from 'erxes-api-shared/core-modules';
export type IAutomationReceiveActionData = {
  action: IAutomationAction;
  execution: { _id: string } & IAutomationExecution;
  actionType: string;
  collectionType: string;
  triggerType: string;
  targetType: string;
};

export type ISendMessageData = {
  senderId: string;
  recipientId: string;
  integration: IInstagramIntegrationDocument;
  message: any;
  tag?: string;
};

export type ICheckTriggerData = {
  collectionType: string;
  automationId: string;
  trigger: IAutomationTrigger;
  target: any;
  config: any;
};

export type IReplacePlaceholdersData = {
  target: IInstagramConversationMessage;
  config: any;
  relatedValueProps: any;
};

export type TInstagramMessageButton = {
  type: 'postback' | 'web_url';
  title: string;
  payload?: string;
  url?: string;
};

export type TQuickReplyMessage = {
  content_type: string;
  title: string;

  payload: string;
  image_url?: string;
};

export type TQuickRepliesMessage = {
  quick_replies: TQuickReplyMessage[];
  text: string;

  botData: any;
  inputData?: any;
};

export type TTextInputMessage = {
  text: string;
  botData: any;
  inputData?: any;
};

export type TTemplateMessage = {
  attachment: {
    type: 'template';
    payload: {
      template_type: 'button';
      text: string;
      buttons: TInstagramMessageButton[];
    };
  };
  botData: any;
  inputData?: any;
};

export type TGenericTemplateMessage = {
  attachment: {
    type: 'template';
    payload: {
      template_type: 'generic';
      elements: {
        title: string;
        subtitle: string;
        image_url: string;
        buttons: TInstagramMessageButton[];
      }[];
    };
  };
  botData: any;
  inputData?: any;
};

export type TAttachmentMessage = {
  attachment: {
    type: 'image' | 'audio' | 'video';
    payload: {
      url: string;
    };
  };
  botData: any;
  inputData?: any;
};

export type TBotConfigMessageButton = {
  _id: string;
  text: string;
  type: 'button' | 'link';
  link?: string;
};

export type TBotConfigMessage = {
  _id: string;
  type: string;
  buttons?: TBotConfigMessageButton[];
  image?: string;
  cards?: {
    _id: string;
    title: string;
    subtitle: string;
    label: string;
    image: string;
    buttons: TBotConfigMessageButton[];
  }[];
  quickReplies?: { _id: string; text: string; image_url?: string }[];
  text?: string;
  audio?: string;
  video?: string;
  attachments?: any[];
  input?: {
    text: string;
    value: string;
    type: 'minute' | 'hour' | 'day' | 'month' | 'year';
  };
};

export type TAutomationActionConfig = {
  botId: string;
  messages: TBotConfigMessage[];
  optionalConnects: {
    sourceId: string;
    actionId: string;
    optionalConnectId: string;
  }[];
};

type TBotDataCarousel = {
  type: 'carousel';
  elements: {
    picture: string;
    title: string;
    subtitle: string;
    buttons: {
      title: any;
      url: any;
      type: string | null;
    }[];
  }[];
};

type TBotDataImage = {
  type: 'file';
  url: string;
};

type TBotDataTemplate = {
  type: 'carousel';
  elements: [
    {
      title: string;
      buttons: {
        title: any;
        url: any;
        type: string | null;
      }[];
    },
  ];
};

type TBotDataText = {
  type: 'text';
  text: string;
};

type TBotDataQuickReplies = {
  type: 'custom';
  component: 'QuickReplies';
  quick_replies: { title: string }[];
};

export type TBotData =
  | TBotDataCarousel
  | TBotDataImage
  | TBotDataTemplate
  | TBotDataText
  | TBotDataQuickReplies;
