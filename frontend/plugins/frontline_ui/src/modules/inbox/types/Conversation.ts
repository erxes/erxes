import type { IAttachment } from 'erxes-ui';
import type { ICustomerInline, IUser } from 'ui-modules';
import type { IIntegration } from '@/integrations/types/Integration';
import type { IFormWidgetItem } from '@/inbox/types/FormWidget';

export interface IConversation {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  customer: ICustomerInline;
  customerId?: string;
  integrationId?: string;
  integration?: IIntegration;
  readUserIds?: string[];
  assignedUserId?: string;
  assignedUser?: IUser;
  tagIds?: string[];
  status?: ConversationStatus;
  automatedReplyControl?: IAutomatedReplyControl;
  callProAudio?: string | null;
  callProPotentialCustomerIds?: string[];
  callProPhone?: string | null;
}

export interface IAutomatedReplyControl {
  status?: 'active' | 'handoff_requested' | 'human_active';
  pausedUntil?: string;
  reason?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IMessagePoll {
  question: string;
  answers: { id: number; text: string; emoji?: string }[];
  allowMultiselect?: boolean;
  expiry?: string;
  results?: {
    isFinalized?: boolean;
    answerCounts: { id: number; count: number }[];
  };
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

export interface IMessageSticker {
  id: string;
  name: string;
  formatType: number;
  url?: string;
}

export interface IMessageForwardedSnapshot {
  content?: string;
  attachments?: IAttachment[];
  embeds?: IMessageEmbed[];
  stickers?: IMessageSticker[];
  poll?: IMessagePoll;
  messageKind: IMessage['messageKind'];
  providerData: IMessage['providerData'];
  createdAt?: string;
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
    poll?: IMessagePoll;
    embeds?: IMessageEmbed[];
    stickers?: IMessageSticker[];
    voiceMessage?: boolean;
    forwardedSnapshot?: IMessageForwardedSnapshot;
    discordEditedAt?: string;
    discordMessageId?: string;
    discordDeletedAt?: string;
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
  messageKind?:
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
  providerData?: {
    attachmentType?: string;
    fallbackReason?: string;
    previewText?: string;
    previewUrl?: string;
    shareType?: 'post' | 'reel';
    storyUrl?: string;
    messageId?: string;
  };
  replyTo?: {
    messageId: string;
    content?: string;
    authorName?: string;
  };
  reactions?: Array<{
    senderId: string;
    emoji?: string;
    reaction?: string;
  }>;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'deleted';
  expiresAt?: string;
}

export enum ConversationStatus {
  NEW = '',
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface IConversationMemberProgress {
  assigneeId: string;
  new: number;
  open: number;
  closed: number;
  resolved: number;
}

export interface IConversationSourceProgressItem {
  source: string;
  count: number;
}

export interface IConversationSourceProgress {
  new: IConversationSourceProgressItem[];
  open: IConversationSourceProgressItem[];
  closed: IConversationSourceProgressItem[];
  resolved: IConversationSourceProgressItem[];
}

export interface IConversationTagProgressItem {
  tagId: string;
  count: number;
}

export interface IConversationTagProgress {
  new: IConversationTagProgressItem[];
  open: IConversationTagProgressItem[];
  closed: IConversationTagProgressItem[];
  resolved: IConversationTagProgressItem[];
}
