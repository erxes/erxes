import mongoose from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { IWebDocument } from '../../@types/web';

export const webSchema = new mongoose.Schema<IWebDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    keywords: { type: [String] },
    domain: { type: String },
    copyright: { type: String },
    logo: { type: attachmentSchema },
    favicon: { type: attachmentSchema },
    thumbnail: { type: attachmentSchema },
    appearances: {
      backgroundColor: String,
      primaryColor: String,
      secondaryColor: String,
      accentColor: String,
      fontSans: String,
      fontHeading: String,
      fontMono: String,
    },
    // deploy fields
    templateId: { type: String },
    templateType: { type: String },
    erxesAppToken: { type: String },
    externalLinks: { type: Map, of: String },
    integrations: {
      googleAnalytics: String,
      facebookPixel: String,
      googleTagManager: String,
      messengerBrandCode: String,
    },
    environmentVariables: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
  },
  { timestamps: true },
);
