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

const headerSchema = new Schema(
  {
    wordmark: { type: String },
    homeLabel: { type: String },
    formsLabel: { type: String },
    announcementsLabel: { type: String },
    searchPlaceholder: { type: String },
  },
  { _id: false },
);

const footerLinkSchema = new Schema(
  {
    label: { type: String },
    url: { type: String },
  },
  { _id: false },
);

const footerColumnSchema = new Schema(
  {
    heading: { type: String },
    links: { type: [footerLinkSchema], default: [] },
  },
  { _id: false },
);

const footerSchema = new Schema(
  {
    logo: { type: String },
    description: { type: String },
    copyright: { type: String },
    columns: { type: [footerColumnSchema], default: [] },
  },
  { _id: false },
);

const cmsConfigSchema = new Schema(
  {
    cmsId: { type: String },
    cmsAppToken: { type: String },
  },
  { _id: false },
);

export const helpCenterConfigSchema = new Schema(
  {
    _id: mongooseStringRandomId,

    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    erxesAppToken: { type: String },
    clientPortalId: { type: String },
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

    formChannelId: { type: String },
    formIds: { type: [String] },

    cmsId: { type: String },
    cmsAppToken: { type: String },
    cmsConfigs: { type: [cmsConfigSchema], default: [] },

    color: { type: String },
    backgroundImage: { type: String },
    styles: { type: stylesSchema },
    header: { type: headerSchema },
    footer: { type: footerSchema },

    createdBy: { type: String },
    modifiedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

helpCenterConfigSchema.index({ brandId: 1 });
