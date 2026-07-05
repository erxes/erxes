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
}

// A poll carried on a message's `extraData` (currently produced by the Discord
// integration). `results` is absent until the first vote.
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

// A preview card carried on a message's `extraData` (produced by the Discord
// integration from a message's `embeds[]`): link previews, Tenor/Giphy GIFs, and
// bot rich embeds. `type` selects the renderer (`gifv`/`video` play inline,
// `image` shows the image, everything else renders as a rich card).
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
  userId?: string;
  customerId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments?: IAttachment[];
  formWidgetData?: IFormWidgetItem[];
  extraData?: { poll?: IMessagePoll; embeds?: IMessageEmbed[] };
  internal?: boolean;
  // Set on messages an automation sent (e.g. the AI Agent), so the inbox can
  // render them differently from human-written messages.
  fromBot?: boolean;
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
