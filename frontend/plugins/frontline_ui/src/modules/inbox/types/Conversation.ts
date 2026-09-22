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

type IMessageAnswer = { id: string | number; text: string; emoji?: string };

type IMessageTally = {
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

export interface IMessageSurveyStep {
  stepId: string;
  name?: string;
  description?: string;
  question: string;
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
    survey?: IMessageSurvey;
    embeds?: IMessageEmbed[];
    discordMessageId?: string;
    discordDeletedAt?: string;
  };
  internal?: boolean;
  botData?: unknown[];
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
