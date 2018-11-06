import { Document, Schema } from "mongoose";
import { field } from "../utils";
import {
  FORM_LOAD_TYPES,
  FORM_SUCCESS_ACTIONS,
  KIND_CHOICES,
  LANGUAGE_CHOICES,
  MESSENGER_DATA_AVAILABILITY
} from "./constants";

export interface ILink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface ITwitterData {
  info?: any;
  token?: string;
  tokenSecret?: string;
}

export interface ITwitterDataDocument extends ITwitterData, Document {}

export interface IFacebookData {
  appId: string;
  pageIds: string[];
}

export interface IFacebookDataDocument extends IFacebookData, Document {}

export interface IGmailData {
  email: string;
  historyId: string;
  credentials?: any;
}

export interface IGmailDataDocument extends IGmailData, Document {}

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
  supporterIds?: string[];
  notifyCustomer?: boolean;
  availabilityMethod?: string;
  isOnline?: boolean;
  onlineHours?: IMessengerOnlineHours[];
  timezone?: string;
  messages?: IMessageDataMessages;
  links?: ILink;
}

export interface IMessengerDataDocument extends IMessengerData, Document {}

export interface IFormData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string;
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankContent?: string;
  redirectUrl?: string;
}

export interface IFormDataDocument extends IFormData, Document {}

export interface IUiOptions {
  color?: string;
  wallpaper?: string;
  logo?: string;
}

// subdocument schema for messenger UiOptions
export interface IUiOptionsDocument extends IUiOptions, Document {}

export interface IIntegration {
  kind?: string;
  name?: string;
  brandId?: string;
  languageCode?: string;
  tagIds?: string[];
  formId?: string;
  formData?: IFormData;
  messengerData?: IMessengerData;
  twitterData?: ITwitterData;
  facebookData?: IFacebookData;
  gmailData?: IGmailData;
  uiOptions?: IUiOptions;
}

export interface IIntegrationDocument extends IIntegration, Document {
  _id: string;
  formData?: IFormDataDocument;
  messengerData?: IMessengerDataDocument;
  twitterData?: ITwitterDataDocument;
  facebookData?: IFacebookDataDocument;
  gmailData?: IGmailDataDocument;
  uiOptions?: IUiOptionsDocument;
}

export interface IMessengerApp {
  email: string;
  credentials?: any;
}

// Mongoose schemas ======================
const twitterSchema = new Schema(
  {
    info: {
      type: Object
    },
    token: {
      type: String
    },
    tokenSecret: {
      type: String
    }
  },
  { _id: false }
);

const facebookSchema = new Schema(
  {
    appId: {
      type: String
    },
    pageIds: {
      type: [String]
    }
  },
  { _id: false }
);

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
    }
  },
  { _id: false }
);

// subdocument schema for FormData
const formDataSchema = new Schema(
  {
    loadType: field({
      type: String,
      enum: FORM_LOAD_TYPES.ALL
    }),
    successAction: field({
      type: String,
      enum: FORM_SUCCESS_ACTIONS.ALL,
      optional: true
    }),
    fromEmail: field({
      type: String,
      optional: true
    }),
    userEmailTitle: field({
      type: String,
      optional: true
    }),
    userEmailContent: field({
      type: String,
      optional: true
    }),
    adminEmails: field({
      type: [String],
      optional: true
    }),
    adminEmailTitle: field({
      type: String,
      optional: true
    }),
    adminEmailContent: field({
      type: String,
      optional: true
    }),
    thankContent: field({
      type: String,
      optional: true
    }),
    redirectUrl: field({
      type: String,
      optional: true
    })
  },
  { _id: false }
);

// subdocument schema for messenger UiOptions
const uiOptionsSchema = new Schema(
  {
    color: field({ type: String }),
    wallpaper: field({ type: String }),
    logo: field({ type: String })
  },
  { _id: false }
);

const gmailSchema = new Schema(
  {
    email: field({ type: String }),
    historyId: field({ type: String }),
    credentials: field({ type: Object })
  },
  { _id: false }
);

// schema for integration document
export const integrationSchema = new Schema({
  _id: field({ pkey: true }),

  kind: field({
    type: String,
    enum: KIND_CHOICES.ALL
  }),

  name: field({ type: String }),
  brandId: field({ type: String }),

  languageCode: field({
    type: String,
    enum: LANGUAGE_CHOICES,
    optional: true
  }),
  tagIds: field({ type: [String], optional: true }),
  formId: field({ type: String }),
  formData: field({ type: formDataSchema }),
  messengerData: field({ type: messengerDataSchema }),
  twitterData: field({ type: twitterSchema }),
  facebookData: field({ type: facebookSchema }),
  gmailData: field({ type: gmailSchema }),
  uiOptions: field({ type: uiOptionsSchema })
});
