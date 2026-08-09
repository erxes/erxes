import { IAttachment } from 'erxes-ui';
import { ICustomerInline, IUser } from 'ui-modules';
import { IIntegration } from '@/integrations/types/Integration';
import { IFormWidgetItem } from './FormWidget';

export interface IConversation {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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

export interface IMessage {
  _id: string;
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
    discordMessageId?: string;
    discordDeletedAt?: string;
  };
  internal?: boolean;
  botData?: unknown[];
  fromBot?: boolean;
  /**
   * Meta's delivery state for a message sent through the WhatsApp channel.
   * Null on every other channel and on any WhatsApp message that has not yet
   * had a status webhook applied to it (the gap between sending and the first
   * "sent" receipt).
   */
  whatsappDelivery?: {
    status: string;
    error?: string | null;
  } | null;
  /** The message this one quotes, on WhatsApp. Null when it quotes nothing. */
  whatsappReplyTo?: {
    _id: string;
    content?: string | null;
  } | null;
  /** This message's own wamid. Null on every non-WhatsApp message. */
  whatsappMid?: string | null;
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
