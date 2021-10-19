// Mongoose schemas =======================

const attachmentSchema = {
  name: { type: String },
  url: { type: String },
  type: { type: String },
  size: { type: Number, optional: true }
};

const customFieldSchema = {
  field: { type: String },
  value: { type: JSON }
};

const ceremonyDataSchema = {
  startedDate: { type: Date, label: 'Date to start working' },
  willDate: { type: Date, label: 'Ceremony date' },
  howManyYear: { type: Number, label: 'How many years' },
  year: { type: Number, label: 'Ceremony year' }
};

const eventDataSchema = {
  visibility: { type: Boolean, enum: ['Public', 'Private'] },
  where: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  interestedUserIds: { type: [String] },
  goingUserIds: { type: [String] }
};

export const FEED_CONTENT_TYPES = {
  POST: 'post',
  EVENT: 'event',
  BRAVO: 'bravo',
  BIRTHDAY: 'birthday',
  WORK_ANNIVARSARY: 'workAnniversary',
  PUBLIC_HOLIDAY: 'publicHoliday',
  ALL: [
    'post',
    'event',
    'bravo',
    'birthday',
    'workAnniversary',
    'publicHoliday'
  ]
};

export const feedSchema = {
  _id: { pkey: true },
  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  images: { type: [attachmentSchema], label: 'Images' },
  attachments: { type: [attachmentSchema], label: 'Attachments' },
  isPinned: { type: Boolean },
  contentType: { type: String, enum: FEED_CONTENT_TYPES.ALL },
  recipientIds: { type: [String] },
  customFieldsData: {
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data'
  },
  ceremonyData: { type: ceremonyDataSchema },
  eventData: { type: eventDataSchema },
  startDate: { type: Date },
  endDate: { type: Date },
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
  type: { type: String, default: 'heart' },
  feedId: { type: String },
  userId: { type: String },
  createdAt: { type: Date, label: 'Created at' },
  updatedBy: { type: String, label: 'Updated by' },
  updatedAt: { type: Date, label: 'Updated at' }
};
