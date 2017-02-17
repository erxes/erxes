import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// twitter schemas ==============
export const twitterSchema = new SimpleSchema({
  id: {
    type: Number,
  },

  token: {
    type: String,
  },

  tokenSecret: {
    type: String,
  },
});

// facebook schemas ==============
export const facebookSchema = new SimpleSchema({
  appId: {
    type: String,
  },

  pageIds: {
    type: [String],
  },
});
