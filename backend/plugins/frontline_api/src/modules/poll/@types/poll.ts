import { HydratedDocument } from 'mongoose';

export interface IPollOption {
  _id: string;
  text: string;
  order: number;
}

export interface IPoll {
  _id: string;
  title: string;
  question: string;
  channelId?: string;
  code?: string;
  options: IPollOption[];
  allowMultiselect?: boolean;
  durationHours?: number;
  status: string;
  sentCount?: number;
  createdUserId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type IPollDocument = HydratedDocument<IPoll>;

export interface IPollVote {
  _id: string;
  pollId: string;
  messageId: string;
  conversationId: string;
  voterId: string;
  customerId?: string;
  visitorId?: string;
  optionIds: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export type IPollVoteDocument = HydratedDocument<IPollVote>;

export interface IPollAnswerSnapshot {
  id: string;
  text: string;
}

export interface IPollAnswerCount {
  id: string;
  count: number;
}

export interface IPollSnapshot {
  pollId: string;
  question: string;
  answers: IPollAnswerSnapshot[];
  allowMultiselect: boolean;
  expiry?: string;
  results: {
    isFinalized: boolean;
    answerCounts: IPollAnswerCount[];
  };
}
