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

const birthdayDataSchema = {
  birthDate: { type: Date, label: 'Birth date' },
  year: { type: Number, label: 'Ceremony year' }
};

const workAnniversaryDataSchema = {
  workStartedDate: { type: Date, label: 'Date to start working' },
  year: { type: Number, label: 'Ceremony year' }
};

export const FEED_CONTENT_TYPES = {
  POST: 'post',
  EVENT: 'event',
  BRAVO: 'bravo',
  BIRTHDAY: 'birthday',
  WORK_ANNIVARSARY: 'workAnniversary',
  ALL: ['post', 'event', 'bravo', 'birthday', 'workAnniversary']
};

export const feedSchema = {
  _id: { pkey: true },
  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  images: { type: [attachmentSchema], label: 'Images' },
  attachments: { type: [attachmentSchema], label: 'Attachments' },
  contentType: { type: String, enum: FEED_CONTENT_TYPES.ALL },
  recipientIds: { type: [String] },
  visibility: { type: String, enum: ['Public', 'Private'] },
  customFieldsData: {
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data'
  },
  birthdayData: { type: birthdayDataSchema },
  workAnniversaryData: { type: workAnniversaryDataSchema },

  where: { type: String },
  impacted: { type: String },
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
