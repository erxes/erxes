import type { Document, Model } from 'mongoose';

export interface ITelegramReactionDocument extends Document {
  _id: string;
  integrationId: string;
  chatId: string;
  messageId: string;
  actorId: string;
  date: number;
  updateId: number;
  reactions: { key: string; label: string; count: number }[];
}
export type ITelegramReactionModel = Model<ITelegramReactionDocument>;
