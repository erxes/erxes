export interface IChat {
  content: string;
}

export interface IChatMessage {
  chatId: string;
  content: string;
}

export const chatMessageSchema = {
  _id: { pkey: true },
  chatId: { type: String, label: 'Connected chat' },
  content: { type: String, label: 'Content' },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: Date, label: 'Created by' }
};

export const chatSchema = {
  _id: { pkey: true },
  name: { type: String },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' }
};
