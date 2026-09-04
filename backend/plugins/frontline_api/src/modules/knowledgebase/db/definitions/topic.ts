import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

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

export const topicSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    description: { type: String },
    brandId: { type: String },
    categoryIds: { type: [String] },
    color: { type: String },
    backgroundImage: { type: String },
    languageCode: { type: String },
    notificationSegmentId: { type: String },

    url: { type: String },
    kbToggle: { type: Boolean },
    kbLabel: { type: String },
    ticketToggle: { type: Boolean },
    ticketLabel: { type: String },
    ticketChannelId: { type: String },
    ticketPipelineId: { type: String },
    ticketStatusId: { type: String },

    styles: { type: stylesSchema },

    createdBy: { type: String },
    modifiedBy: { type: String },
    modifiedDate: { type: Date },
    title: { type: String, required: true },
    code: { type: String },
  },
  {
    timestamps: true,
  },
);

topicSchema.index({ code: 1 }, { unique: true, sparse: true });
