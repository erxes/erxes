import { Document, Schema } from "mongoose";

import {
  CUSTOMER_LEAD_STATUS_TYPES,
  CUSTOMER_LIFECYCLE_STATE_TYPES
} from "./constants";

import { field } from "../utils";

export interface ILocation {
  remoteAddress: string;
  country: string;
  city: string;
  region: string;
  hostname: string;
  language: string;
  userAgent: string;
}

export interface ILocationDocument extends ILocation, Document {}

export interface IVisitorContact {
  email?: string;
  phone?: string;
}

export interface IVisitorContactDocument extends IVisitorContact, Document {}

export interface IMessengerData {
  lastSeenAt?: number;
  sessionCount?: number;
  isActive?: boolean;
  customData?: any;
}

export interface IMessengerDataDocument extends IMessengerData, Document {}

export interface ITwitterData {
  id?: number;
  id_str?: string;
  name?: string;
  screen_name?: string;
  profile_image_url?: string;
}

export interface ITwitterDataDocument extends ITwitterData, Document {
  id: number;
}

export interface IFacebookData {
  id: string;
  profilePic?: string;
}

export interface IFacebookDataDocument extends IFacebookData, Document {
  id: string;
}

export interface ILink {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

interface ILinkDocument extends ILink, Document {}

export interface ICustomer {
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  primaryPhone?: string;
  phones?: string[];

  ownerId?: string;
  position?: string;
  department?: string;
  leadStatus?: string;
  lifecycleState?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  links?: ILink;
  isUser?: boolean;
  integrationId?: string;
  tagIds?: string[];
  companyIds?: string[];
  customFieldsData?: any;
  messengerData?: IMessengerData;
  twitterData?: ITwitterData;
  facebookData?: IFacebookData;
  location?: ILocation;
  visitorContactInfo?: IVisitorContact;
  urlVisits?: any;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: string;
  messengerData?: IMessengerDataDocument;
  twitterData?: ITwitterDataDocument;
  facebookData?: IFacebookDataDocument;
  location?: ILocationDocument;
  links?: ILinkDocument;
  visitorContactInfo?: IVisitorContactDocument;
  createdAt: Date;
  modifiedAt: Date;
}

/* location schema */
const locationSchema = new Schema(
  {
    remoteAddress: String,
    country: String,
    city: String,
    region: String,
    hostname: String,
    language: String,
    userAgent: String
  },
  { _id: false }
);

const visitorContactSchema = new Schema(
  {
    email: String,
    phone: String
  },
  { _id: false }
);

/*
 * messenger schema
 */
const messengerSchema = new Schema(
  {
    lastSeenAt: field({
      type: Date,
      label: "Last seen at"
    }),
    sessionCount: field({
      type: Number,
      label: "Session count"
    }),
    isActive: field({
      type: Boolean,
      label: "Is online"
    }),
    customData: field({
      type: Object,
      optional: true
    })
  },
  { _id: false }
);

/*
 * Twitter schema
 * Saving fields with underscores because, we want to store it exactly
 * like twitter response so that we can use it in findParentTweets helper to
 * not send extra request to twitter
 */
const twitterSchema = new Schema(
  {
    id: field({ type: Number, label: "Twitter ID (Number)" }),
    id_str: field({ type: String, label: "Twitter ID" }),
    name: field({ type: String, label: "Twitter name" }),
    screen_name: field({ type: String, label: "Twitter screen name" }),
    profile_image_url: field({ type: String, label: "Twitter photo" })
  },
  { _id: false }
);

/*
 * facebook schema
 */
const facebookSchema = new Schema(
  {
    id: field({
      type: String,
      label: "Facebook ID"
    }),
    profilePic: field({
      type: String,
      optional: true,
      label: "Facebook photo"
    })
  },
  { _id: false }
);

const linkSchema = new Schema(
  {
    linkedIn: field({ type: String, optional: true, label: "LinkedIn" }),
    twitter: field({ type: String, optional: true, label: "Twitter" }),
    facebook: field({ type: String, optional: true, label: "Facebook" }),
    github: field({ type: String, optional: true, label: "Github" }),
    youtube: field({ type: String, optional: true, label: "Youtube" }),
    website: field({ type: String, optional: true, label: "Website" })
  },
  { _id: false }
);

export const customerSchema = new Schema({
  _id: field({ pkey: true }),

  createdAt: field({ type: Date, label: "Created at" }),
  modifiedAt: field({ type: Date, label: "Modified at" }),
  avatar: field({ type: String, optional: true }),

  firstName: field({ type: String, label: "First name", optional: true }),
  lastName: field({ type: String, label: "Last name", optional: true }),

  primaryEmail: field({ type: String, label: "Primary Email", optional: true }),
  emails: field({ type: [String], optional: true }),

  primaryPhone: field({ type: String, label: "Primary Phone", optional: true }),
  phones: field({ type: [String], optional: true }),

  ownerId: field({ type: String, optional: true }),
  position: field({ type: String, optional: true, label: "Position" }),
  department: field({ type: String, optional: true, label: "Department" }),

  leadStatus: field({
    type: String,
    enum: CUSTOMER_LEAD_STATUS_TYPES,
    optional: true,
    label: "Lead Status"
  }),

  lifecycleState: field({
    type: String,
    enum: CUSTOMER_LIFECYCLE_STATE_TYPES,
    optional: true,
    label: "Lifecycle State"
  }),

  hasAuthority: field({ type: String, optional: true, label: "Has authority" }),
  description: field({ type: String, optional: true, label: "Description" }),
  doNotDisturb: field({
    type: String,
    optional: true,
    label: "Do not disturb"
  }),
  links: field({ type: linkSchema, default: {} }),

  isUser: field({ type: Boolean, label: "Is user", optional: true }),

  integrationId: field({ type: String, optional: true }),
  tagIds: field({ type: [String], optional: true }),
  companyIds: field({ type: [String], optional: true }),

  customFieldsData: field({ type: Object, optional: true }),
  messengerData: field({ type: messengerSchema, optional: true }),
  twitterData: field({ type: twitterSchema, optional: true }),
  facebookData: field({ type: facebookSchema, optional: true }),

  location: field({ type: locationSchema, optional: true }),

  // if customer is not a user then we will contact with this visitor using
  // this information
  visitorContactInfo: field({ type: visitorContactSchema, optional: true }),
  urlVisits: Object
});
