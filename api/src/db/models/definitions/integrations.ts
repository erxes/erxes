import { Document, Schema } from 'mongoose';
import { attachmentSchema } from './boards';
import { IRule, ruleSchema } from './common';
import {
  KIND_CHOICES,
  LEAD_LOAD_TYPES,
  LEAD_SUCCESS_ACTIONS,
  MESSENGER_DATA_AVAILABILITY
} from './constants';
import { field, schemaHooksWrapper } from './utils';

export interface ISubmission extends Document {
  customerId: string;
  submittedAt: Date;
}

export interface ILink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface IMessengerOnlineHours {
  day?: string;
  from?: string;
  to?: string;
}

export interface IMessengerOnlineHoursDocument
  extends IMessengerOnlineHours,
    Document {}

export interface IMessengerDataMessagesItem {
  greetings?: { title?: string; message?: string };
  away?: string;
  thank?: string;
  welcome?: string;
}

export interface IMessageDataMessages {
  [key: string]: IMessengerDataMessagesItem;
}

export interface IMessengerData {
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  skillData?: {
    typeId: string;
    options: Array<{
      label: string;
      response: string;
      typeId: string;
    }>;
  };
  supporterIds?: string[];
  notifyCustomer?: boolean;
  availabilityMethod?: string;
  isOnline?: boolean;
  onlineHours?: IMessengerOnlineHours[];
  timezone?: string;
  messages?: IMessageDataMessages;
  links?: ILink;
  showChat?: boolean;
  showLauncher?: boolean;
  requireAuth?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
}

export interface IMessengerDataDocument extends IMessengerData, Document {}

export interface ICallout extends Document {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
}

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface IBookingStyle {
  itemShape?: string;
  widgetColor?: string;
  productAvailable?: string;
  productUnavailable?: string;
  productSelected?: string;

  textAvailable?: string;
  textUnavailable?: string;
  textSelected?: string;

  line?: string;
  rows?: number;
  columns?: number;
  margin?: number;
}

export interface IBookingData {
  name?: string;
  description?: string;
  image?: IAttachment;
  style?: IBookingStyle;
  userFilters?: string[];
  productCategoryId?: string;
  viewCount?: number;
}

export interface IBookingDataDocument extends IBookingData, Document {
  viewCount?: number;
}

export interface ILeadData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string;
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IRule;
  viewCount?: number;
  contactsGathered?: number;
  isRequireOnce?: boolean;
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
}

export interface IWebhookData {
  script: string;
  token: string;
  origin: string;
}

export interface ILeadDataDocument extends ILeadData, Document {
  viewCount?: number;
  contactsGathered?: number;
}

export interface IUiOptions {
  color?: string;
  wallpaper?: string;
  logo?: string;
  textColor?: string;
}

// subdocument schema for messenger UiOptions
export interface IUiOptionsDocument extends IUiOptions, Document {}

export interface IIntegration {
  kind: string;
  name?: string;
  brandId?: string;
  languageCode?: string;
  tagIds?: string[];
  formId?: string;
  leadData?: ILeadData;
  messengerData?: IMessengerData;
  uiOptions?: IUiOptions;
  isActive?: boolean;
  channelIds?: string[];
  bookingData?: IBookingData;
}

export interface IIntegrationDocument extends IIntegration, Document {
  _id: string;
  createdUserId: string;
  // TODO remove
  formData?: ILeadData;
  leadData?: ILeadDataDocument;
  messengerData?: IMessengerDataDocument;
  webhookData?: IWebhookData;
  uiOptions?: IUiOptionsDocument;
  bookingData?: IBookingDataDocument;
}

// subdocument schema for MessengerOnlineHours
const messengerOnlineHoursSchema = new Schema(
  {
    day: field({ type: String }),
    from: field({ type: String }),
    to: field({ type: String })
  },
  { _id: false }
);

// subdocument schema for MessengerData
const messengerDataSchema = new Schema(
  {
    skillData: field({ type: Object, optional: true }),
    botEndpointUrl: field({ type: String }),
    botShowInitialMessage: field({ type: Boolean }),
    supporterIds: field({ type: [String] }),
    notifyCustomer: field({ type: Boolean }),
    availabilityMethod: field({
      type: String,
      enum: MESSENGER_DATA_AVAILABILITY.ALL
    }),
    isOnline: field({
      type: Boolean
    }),
    onlineHours: field({ type: [messengerOnlineHoursSchema] }),
    timezone: field({
      type: String,
      optional: true
    }),
    messages: field({ type: Object, optional: true }),
    links: {
      facebook: String,
      twitter: String,
      youtube: String
    },
    requireAuth: field({ type: Boolean, default: true }),
    showChat: field({ type: Boolean, default: true }),
    showLauncher: field({ type: Boolean, default: true }),
    forceLogoutWhenResolve: field({ type: Boolean, default: false }),
    showVideoCallRequest: field({ type: Boolean, default: false })
  },
  { _id: false }
);

// schema for lead's callout component
export const calloutSchema = new Schema(
  {
    title: field({ type: String, optional: true, label: 'Title' }),
    body: field({ type: String, optional: true, label: 'Body' }),
    buttonText: field({ type: String, optional: true, label: 'Button text' }),
    featuredImage: field({
      type: String,
      optional: true,
      label: 'Featured image'
    }),
    skip: field({ type: Boolean, optional: true, label: 'Skip' })
  },
  { _id: false }
);

// TODO: remove
// schema for lead submission details
export const submissionSchema = new Schema(
  {
    customerId: field({ type: String }),
    submittedAt: field({ type: Date })
  },
  { _id: false }
);

// subdocument schema for LeadData
export const leadDataSchema = new Schema(
  {
    loadType: field({
      type: String,
      enum: LEAD_LOAD_TYPES.ALL,
      label: 'Load type'
    }),
    successAction: field({
      type: String,
      enum: LEAD_SUCCESS_ACTIONS.ALL,
      optional: true,
      label: 'Success action'
    }),
    fromEmail: field({
      type: String,
      optional: true,
      label: 'From email'
    }),
    userEmailTitle: field({
      type: String,
      optional: true,
      label: 'User email title'
    }),
    userEmailContent: field({
      type: String,
      optional: true,
      label: 'User email content'
    }),
    adminEmails: field({
      type: [String],
      optional: true,
      label: 'Admin emails'
    }),
    adminEmailTitle: field({
      type: String,
      optional: true,
      label: 'Admin email title'
    }),
    adminEmailContent: field({
      type: String,
      optional: true,
      label: 'Admin email content'
    }),
    thankTitle: field({
      type: String,
      optional: true,
      label: 'Thank content title'
    }),
    thankContent: field({
      type: String,
      optional: true,
      label: 'Thank content'
    }),
    redirectUrl: field({
      type: String,
      optional: true,
      label: 'Redirect URL'
    }),
    themeColor: field({
      type: String,
      optional: true,
      label: 'Theme color code'
    }),
    callout: field({
      type: calloutSchema,
      optional: true,
      label: 'Callout'
    }),
    viewCount: field({
      type: Number,
      optional: true,
      label: 'View count'
    }),
    contactsGathered: field({
      type: Number,
      optional: true,
      label: 'Contacts gathered'
    }),
    rules: field({
      type: [ruleSchema],
      optional: true,
      label: 'Rules'
    }),
    isRequireOnce: field({
      type: Boolean,
      optional: true,
      label: 'Do now show again if already filled out'
    }),
    templateId: field({
      type: String,
      optional: true,
      label: 'Template'
    }),
    attachments: field({ type: Object, optional: true, label: 'Attachments' }),
    css: field({
      type: String,
      optional: true,
      label: 'Custom CSS'
    })
  },
  { _id: false }
);

// subdocument schema for messenger UiOptions
const uiOptionsSchema = new Schema(
  {
    color: field({ type: String }),
    textColor: field({ type: String }),
    wallpaper: field({ type: String }),
    logo: field({ type: String })
  },
  { _id: false }
);

const webhookDataSchema = new Schema(
  {
    script: field({ type: String, optional: true }),
    token: field({ type: String }),
    origin: field({ type: String, optional: true })
  },
  { _id: false }
);

export const bookingStyleSchema = new Schema(
  {
    itemShape: field({ type: String, optional: true, label: 'Shape' }),
    widgetColor: field({ type: String, label: 'Widget color' }),

    productAvailable: field({ type: String, label: 'Product available' }),
    productUnavailable: field({ type: String, label: 'Product unavailable' }),
    productSelected: field({ type: String, label: 'Select Product' }),

    textAvailable: field({ type: String, label: 'Text available' }),
    textUnavailable: field({ type: String, label: 'Text unavailable' }),
    textSelected: field({ type: String, label: 'Select text' }),

    line: field({ type: String, optional: true, label: 'Line' }),
    columns: field({ type: Number, optional: true, label: 'Columns' }),
    rows: field({ type: Number, optional: true, label: 'Rows' }),
    margin: field({ type: Number, optional: true, label: 'Margin' })
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    name: field({ type: String }),
    description: field({ type: String }),
    image: field({ type: attachmentSchema }),

    style: field({ type: bookingStyleSchema }),
    userFilters: field({ type: [String], optional: true, label: 'Filter' }),

    productCategoryId: field({
      type: String,
      optional: true,
      label: 'Product category'
    }),
    viewCount: field({
      type: Number,
      optional: true,
      label: 'View count'
    })
  },
  { _id: false }
);

// schema for integration document
export const integrationSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdUserId: field({ type: String, label: 'Created by' }),

    kind: field({
      type: String,
      enum: KIND_CHOICES.ALL,
      label: 'Kind'
    }),

    name: field({ type: String, label: 'Name' }),
    brandId: field({ type: String, label: 'Brand' }),

    languageCode: field({
      type: String,
      optional: true,
      label: 'Language code'
    }),
    tagIds: field({ type: [String], label: 'Tags' }),
    formId: field({ type: String, label: 'Form' }),
    leadData: field({ type: leadDataSchema, label: 'Lead data' }),
    isActive: field({
      type: Boolean,
      optional: true,
      default: true,
      label: 'Is active'
    }),
    webhookData: field({ type: webhookDataSchema }),
    // TODO: remove
    formData: field({ type: leadDataSchema }),
    messengerData: field({ type: messengerDataSchema }),
    uiOptions: field({ type: uiOptionsSchema }),

    bookingData: field({ type: bookingSchema })
  }),
  'erxes_integrations'
);
