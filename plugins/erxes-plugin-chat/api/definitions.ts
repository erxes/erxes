const attachmentSchema = {
  name: { type: String },
  url: { type: String },
  type: { type: String },
  size: { type: Number, optional: true }
};
export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
}
export interface IChat {
  name: string;
  participantIds: string[];
  userIds: string[];
}

export interface IChatMessage {
  chatId: string;
  content: string;
  isPinned: boolean;
  attachments: IAttachment[];
}

export const CHAT_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
  ALL: ['direct', 'group']
};

export const VISIBILITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ALL: ['public', 'private']
};

export const chatMessageSchema = {
  _id: { pkey: true },
  attachments: { type: [attachmentSchema], label: 'attachments' },
  chatId: { type: String, label: 'Connected chat' },
  isPinned: { type: Boolean, default: false, label: 'Has pinned' },
  content: { type: String, label: 'Content' },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' }
};

export const chatSchema = {
  _id: { pkey: true },
  name: { type: String },
  description: { type: String },
  visibility: { type: String, enum: VISIBILITIES.ALL },
  type: { type: String, enum: CHAT_TYPE.ALL },
  isPinned: { type: Boolean, default: false, label: 'Has pinned' },
  participantIds: { type: [String], label: 'User ids' },
  adminIds: { type: [String], label: 'Admin user ids' },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' }
};
