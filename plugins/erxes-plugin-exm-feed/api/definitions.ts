// Mongoose schemas =======================

const attachmentSchema = {
  name: { type: String },
  url: { type: String },
  type: { type: String },
  size: { type: Number, optional: true }
};

export const feedSchema = {
  _id: { pkey: true },
  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  images: { type: [attachmentSchema], label: 'Images' },
  attachments: { type: [attachmentSchema], label: 'Attachments' },
  contentType: { type: String },
  recipientIds: { type: [String] },
  visibility: { type: String, enum: ['Public', 'Private'] },
  where: { type: String },
  startDate: { type: Date },
  endDate: { type: Date}, 
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};

export const thankSchema = {
  _id: { pkey: true },
  description: { type: String, label: 'Description' },
  recipientIds: { type: [String] },
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};

export const commentSchema = {
  _id: { pkey: true },
  feedId: { type: String },
  parentId: { type: String },
  comment: { type: String, label: 'Comment' },
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};

export const emojiSchema = {
  _id: { pkey: true },
  type: { type: String, default: 'like' },
  feedId: { type: String },
  userId: { type: String },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};
