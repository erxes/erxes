// subdocument schema for MessengerOnlineHours
import { Schema } from 'mongoose';
import { ruleSchema } from 'erxes-api-shared/core-modules';
import {
  LEAD_LOAD_TYPES,
  LEAD_SUCCESS_ACTIONS,
  MESSENGER_DATA_AVAILABILITY,
} from './constants';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const messengerOnlineHoursSchema = new Schema(
  {
    day: { type: String },
    from: { type: String },
    to: { type: String },
  },
  { _id: false },
);

const persistentMenuSchema = new Schema({
  _id: { type: String },
  text: { type: String },
  type: { type: String },
  link: { type: String, optional: true },
  isEditing: { type: Boolean },
});

// subdocument schema for MessengerData
const messengerDataSchema = new Schema(
  {
    skillData: { type: Object, optional: true },
    botEndpointUrl: { type: String },
    botShowInitialMessage: { type: Boolean },
    getStarted: { type: Boolean },
    botCheck: { type: Boolean },
    botGreetMessage: { type: String },
    persistentMenus: { type: [persistentMenuSchema] }, // Corrected to an array
    supporterIds: { type: [String] },
    notifyCustomer: { type: Boolean },
    availabilityMethod: {
      type: String,
      enum: MESSENGER_DATA_AVAILABILITY.ALL,
    },
    isOnline: {
      type: Boolean,
    },
    onlineHours: { type: [messengerOnlineHoursSchema] },
    timezone: {
      type: String,
      optional: true,
    },
    responseRate: {
      type: String,
      optional: true,
    },
    showTimezone: {
      type: Boolean,
      optional: true,
    },
    messages: { type: Object, optional: true },
    links: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    externalLinks: { type: Object, optional: true },
    requireAuth: { type: Boolean, default: true },
    showChat: { type: Boolean, default: true },
    showLauncher: { type: Boolean, default: true },
    hideWhenOffline: { type: Boolean, default: false },
    forceLogoutWhenResolve: { type: Boolean, default: false },
    showVideoCallRequest: { type: Boolean, default: false },
  },
  { _id: false },
);

// schema for lead's callout component
export const calloutSchema = new Schema(
  {
    title: { type: String, optional: true, label: 'Title' },
    body: { type: String, optional: true, label: 'Body' },
    buttonText: { type: String, optional: true, label: 'Button text' },
    calloutImgSize: {
      type: String,
      optional: true,
      label: 'Callout image size',
    },
    featuredImage: {
      type: String,
      optional: true,
      label: 'Featured image',
    },
    skip: { type: Boolean, optional: true, label: 'Skip' },
  },
  { _id: false },
);

// TODO: remove
// schema for lead submission details
export const submissionSchema = new Schema(
  {
    customerId: { type: String },
    submittedAt: { type: Date },
  },
  { _id: false },
);

// subdocument schema for LeadData
export const leadDataSchema = new Schema(
  {
    loadType: {
      type: String,
      enum: LEAD_LOAD_TYPES.ALL,
      label: 'Load type',
    },
    successAction: {
      type: String,
      enum: LEAD_SUCCESS_ACTIONS.ALL,
      optional: true,
      label: 'Success action',
    },
    fromEmail: {
      type: String,
      optional: true,
      label: 'From email',
    },
    userEmailTitle: {
      type: String,
      optional: true,
      label: 'User email title',
    },
    userEmailContent: {
      type: String,
      optional: true,
      label: 'User email content',
    },
    adminEmails: {
      type: [String],
      optional: true,
      label: 'Admin emails',
    },
    adminEmailTitle: {
      type: String,
      optional: true,
      label: 'Admin email title',
    },
    adminEmailContent: {
      type: String,
      optional: true,
      label: 'Admin email content',
    },
    thankTitle: {
      type: String,
      optional: true,
      label: 'Thank content title',
    },
    thankContent: {
      type: String,
      optional: true,
      label: 'Thank content',
    },
    redirectUrl: {
      type: String,
      optional: true,
      label: 'Redirect URL',
    },
    themeColor: {
      type: String,
      optional: true,
      label: 'Theme color code',
    },
    callout: {
      type: calloutSchema,
      optional: true,
      label: 'Callout',
    },
    viewCount: {
      type: Number,
      optional: true,
      label: 'View count',
    },
    contactsGathered: {
      type: Number,
      optional: true,
      label: 'Contacts gathered',
    },
    rules: {
      type: [new Schema(ruleSchema.obj)],
      optional: true,
      label: 'Rules',
    },
    isRequireOnce: {
      type: Boolean,
      optional: true,
      label: 'Do not show again if already filled out',
    },
    saveAsCustomer: {
      type: Boolean,
      optional: true,
      label: 'Save as customer',
    },
    templateId: {
      type: String,
      optional: true,
      label: 'Template',
    },
    attachments: { type: Object, optional: true, label: 'Attachments' },
    css: {
      type: String,
      optional: true,
      label: 'Custom CSS',
    },
    successImage: {
      type: String,
      optional: true,
      label: 'Success image',
    },
    successImageSize: {
      type: String,
      optional: true,
      label: 'Success image size',
    },
    verifyEmail: {
      type: Boolean,
      optional: true,
      label: 'Verify email',
    },
  },
  { _id: false },
);

// subdocument schema for messenger UiOptions
const uiOptionsSchema = new Schema(
  {
    color: { type: String },
    textColor: { type: String },
    wallpaper: { type: String },
    logo: { type: String },
  },
  { _id: false },
);

const webhookDataSchema = new Schema(
  {
    script: { type: String, optional: true },
    token: { type: String },
    origin: { type: String, optional: true },
  },
  { _id: false },
);

// schema for integration document
export const integrationSchema = schemaWrapper(
  new Schema({
    _id: { type: String, label: '_id' },
    createdUserId: { type: String, label: 'Created by' },
    channelId: { type: String, label: 'Channel id' },
    kind: {
      type: String,
      label: 'Kind',
    },
    createdAt: { type: 'Date', label: 'Created at' },

    name: { type: String, label: 'Name' },

    tagIds: { type: [String], label: 'Tags', index: true },
    formId: { type: String, label: 'Form' },
    isActive: {
      type: Boolean,
      optional: true,
      default: true,
      label: 'Is active',
    },
    isConnected: {
      type: Boolean,
      optional: true,
      default: false,
      label: 'Is connected',
    },
    webhookData: { type: webhookDataSchema },
    // TODO: remove
    formData: { type: leadDataSchema },
    messengerData: { type: messengerDataSchema },
    uiOptions: { type: uiOptionsSchema },
  }),
);
