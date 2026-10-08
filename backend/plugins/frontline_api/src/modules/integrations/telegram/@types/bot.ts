import { Document } from 'mongoose';

export interface ITelegramBot {
  botId: string;
  erxesApiId?: string;
  botUsername?: string;
  botName: string;
  token: string;
  webhookSecret: string;
  canJoinGroups?: boolean;
  canReadAllGroupMessages?: boolean;
  lastVerifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ITelegramBotCreateInput {
  token: string;
  createdBy: string;
}

export interface ITelegramBotDocument extends ITelegramBot, Document {
  _id: string;
}
