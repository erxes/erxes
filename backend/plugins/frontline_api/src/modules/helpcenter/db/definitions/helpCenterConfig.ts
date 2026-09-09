import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const stylesSchema = new Schema(
  {
    mainLogo: { type: String },
    favicon: { type: String },

    bodyColor: { type: String },
    headerColor: { type: String },
    footerColor: { type: String },
    helpCenterColor: { type: String },
    backgroundColor: { type: String },
    activeTabColor: { type: String },

    baseFont: { type: String },
    baseColor: { type: String },
    headingFont: { type: String },
    headingColor: { type: String },
    linkColor: { type: String },
    linkHoverColor: { type: String },

    primaryButtonColor: { type: String },
    secondaryButtonColor: { type: String },
    dividerColor: { type: String },

    headerHtml: { type: String },
    footerHtml: { type: String },
  },
  { _id: false },
);

export const helpCenterConfigSchema = new Schema(
  {
    _id: mongooseStringRandomId,

    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    brandId: { type: String },
    languageCode: { type: String },

    kbToggle: { type: Boolean },
    kbLabel: { type: String },
    kbTopicId: { type: String },

    ticketToggle: { type: Boolean },
    ticketLabel: { type: String },
    ticketChannelId: { type: String },
    ticketPipelineId: { type: String },
    ticketStatusId: { type: String },

    color: { type: String },
    backgroundImage: { type: String },
    styles: { type: stylesSchema },

    createdBy: { type: String },
    modifiedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

helpCenterConfigSchema.index({ brandId: 1 });
