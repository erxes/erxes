const CONTENT_TYPES = {
  ALL: ['exmFeed', 'knowledgebase']
};

export const commentSchema = {
  _id: { pkey: true },
  contentType: {
    type: String,
    enum: CONTENT_TYPES.ALL,
    label: 'Connected content type'
  },
  contentId: { type: String, label: 'Connected content id' },
  parentId: { type: String },
  comment: { type: String, label: 'Comment' },
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};

export const emojiSchema = {
  _id: { pkey: true },
  type: { type: String, default: 'heart' },
  contentType: {
    type: String,
    enum: CONTENT_TYPES.ALL,
    label: 'Connected content type'
  },
  contentId: { type: String, label: 'Connected content id' },
  userId: { type: String },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};
