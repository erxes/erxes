import type { IAttachment } from 'erxes-ui';
import type { ICustomerInline } from 'ui-modules';
import type { IFormWidgetItem } from '@/inbox/types/FormWidget';
import type {
  ConversationDetailQuery,
  ConversationMemberProgressQuery,
  ConversationsQuery,
  IntegrationInlineQuery,
} from '~/gql/graphql';

export type IConversation = NonNullable<
  NonNullable<NonNullable<ConversationsQuery['conversations']>['list']>[number]
>;

export type IConversationDetail = NonNullable<
  ConversationDetailQuery['conversationDetail']
>;

export type IConversationIntegration = NonNullable<
  IConversation['integration']
>;

/** The detail page loads the integration through `IntegrationInline`, so only its fields are guaranteed. */
export type IConversationContextIntegration = NonNullable<
  IntegrationInlineQuery['integrationDetail']
> &
  Partial<IConversationIntegration>;

type IConversationContextFields = Partial<
  Omit<IConversation, 'customer' | 'integration' | 'tagIds'>
> &
  Partial<Omit<IConversationDetail, 'customer' | 'integration' | 'tagIds'>>;

/** A list row, a conversation detail, or both merged, as the conversation context holds them. */
export type IConversationContextValue = IConversationContextFields & {
  _id: string;
  customer?: ICustomerInline;
  integration?: IConversationContextIntegration;
  loading?: boolean;
};

export type IConversationMemberProgress = NonNullable<
  NonNullable<
    ConversationMemberProgressQuery['conversationMemberProgress']
  >[number]
>;

type IMessageAnswer = { id: string | number; text: string; emoji?: string };

type IMessageTally = {
  totalVoters?: number;
  isFinalized?: boolean;
  answerCounts: { id: string | number; count: number }[];
};

export interface IMessagePoll {
  question: string;
  answers: IMessageAnswer[];
  allowMultiselect?: boolean;
  expiry?: string;
  results?: IMessageTally;
}

export interface IMessageSurveyAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface IMessageSurveyStep {
  stepId: string;
  name?: string;
  description?: string;
  question: string;
  attachments?: IMessageSurveyAttachment[];
  answers: IMessageAnswer[];
  allowMultiselect?: boolean;
}

export interface IMessageSurvey {
  surveyId?: string;
  question: string;
  answers: IMessageAnswer[];
  allowMultiselect?: boolean;
  steps?: IMessageSurveyStep[];
  expiry?: string;
  results?: IMessageTally;
}

export interface IMessageEmbed {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  author?: { name?: string; url?: string; iconUrl?: string };
  provider?: { name?: string; url?: string };
  thumbnail?: { url?: string; width?: number; height?: number };
  image?: { url?: string; width?: number; height?: number };
  video?: { url?: string; width?: number; height?: number };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text?: string; iconUrl?: string };
  timestamp?: string;
}

export type MessageKind =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'share'
  | 'story_mention'
  | 'story_reply'
  | 'sticker'
  | 'voice'
  | 'forwarded'
  | 'deleted'
  | 'unsupported';

export interface IMessageProviderData {
  attachmentType?: string;
  fallbackReason?: string;
  previewText?: string;
  previewUrl?: string;
  shareType?: 'post' | 'reel';
  storyUrl?: string;
  messageId?: string;
}

export interface IMessageReplyTo {
  messageId: string;
  content?: string;
  authorName?: string;
}

export interface IMessageReaction {
  senderId: string;
  emoji?: string;
  reaction?: string;
}

export interface IMessageSticker {
  id: string;
  name: string;
  formatType?: number;
  url?: string;
}

export interface IMessageForwardedSnapshot {
  content?: string;
  attachments?: IAttachment[];
  embeds?: IMessageEmbed[];
  stickers?: IMessageSticker[];
  poll?: IMessagePoll;
  createdAt?: string;
}

export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read' | 'deleted';

export interface ITelegramMessageData {
  senderName?: string;
  messageId?: string;
  messageIds?: string[];
  chatType?: string;
  contentType?: string;
  mediaGroupId?: string;
  editedAt?: string;
  topicName?: string;
  replyTo?: {
    messageId: string;
    chatId: string;
    senderName: string;
    content: string;
  };
  reactions?: { key: string; label: string; count: number }[];
}

export interface IMessage {
  _id: string;
  mid?: string;
  conversationId?: string;
  userId?: string;
  customerId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments?: IAttachment[];
  formWidgetData?: IFormWidgetItem[];
  extraData?: {
    telegram?: ITelegramMessageData;
    poll?: IMessagePoll;
    survey?: IMessageSurvey;
    embeds?: IMessageEmbed[];
    stickers?: IMessageSticker[];
    voiceMessage?: boolean;
    forwardedSnapshot?: IMessageForwardedSnapshot;
    forwardedNote?: string;
    discordMessageId?: string;
    discordDeletedAt?: string;
    discordEditedAt?: string;
    discordPinned?: boolean;
    reactions?: Array<{
      senderId: string;
      emoji?: string;
      reaction?: string;
    }>;
    forwardedFrom?: {
      conversationId: string;
      messageId: string;
    };
  };
  internal?: boolean;
  botData?: unknown[];
  fromBot?: boolean;
  messageKind?: MessageKind;
  providerData?: IMessageProviderData;
  replyTo?: IMessageReplyTo;
  reactions?: IMessageReaction[];
  deliveryStatus?: MessageDeliveryStatus;
  expiresAt?: string;
}

export enum ConversationStatus {
  NEW = '',
  OPEN = 'open',
  CLOSED = 'closed',
}
