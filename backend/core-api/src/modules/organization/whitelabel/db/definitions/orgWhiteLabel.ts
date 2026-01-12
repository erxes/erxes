import mongoose from 'mongoose';

export const orgWhiteLabelSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'ORG_WHITE_LABEL', // 🔒 system-wide singleton
    },

    orgLogo: String,
    orgLoginText: String,
    orgLoginDescription: String,
    orgFavicon: String,
    orgShortDescription: String,
    orgShortName: String,
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
