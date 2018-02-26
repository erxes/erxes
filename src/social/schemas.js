import mongoose from 'mongoose';

export const TwitterSchema = mongoose.Schema(
  {
    info: {
      type: Object,
    },
    token: {
      type: String,
    },
    tokenSecret: {
      type: String,
    },
  },
  { _id: false },
);

export const FacebookSchema = mongoose.Schema(
  {
    appId: {
      type: String,
    },
    pageIds: {
      type: [String],
    },
  },
  { _id: false },
);
