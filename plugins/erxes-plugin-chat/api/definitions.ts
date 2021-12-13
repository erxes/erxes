export interface IChat {
  name: string;
  participantIds: string[];
}

export interface IChatMessage {
  chatId: string;
  content: string;
}

export const CHAT_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
  ALL: ['direct', 'group']
};

export const chatMessageSchema = {
  _id: { pkey: true },
  chatId: { type: String, label: 'Connected chat' },
  content: { type: String, label: 'Content' },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' }
};

export const chatSchema = {
  _id: { pkey: true },
  name: { type: String },
  type: { type: String, enum: CHAT_TYPE.ALL },
  participantIds: { type: [String], label: 'User ids' },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' }
};
