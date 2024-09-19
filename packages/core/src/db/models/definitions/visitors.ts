import { Document, Model, Schema } from "mongoose";
import { field } from "./utils";

export interface ILocation {
  remoteAddress: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  hostname: string;
  language: string;
  userAgent: string;
}

export interface ILocationDocument extends ILocation, Document {}

export interface IVistiorDoc {
  visitorId: string;
  integrationId?: string;
  location?: ILocationDocument;
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
}

export const locationSchema = new Schema(
  {
    remoteAddress: field({
      type: String,
      label: "Remote address",
      optional: true
    }),
    country: field({ type: String, label: "Country", optional: true }),
    countryCode: field({ type: String, label: "Country code", optional: true }),
    city: field({ type: String, label: "City", optional: true }),
    region: field({ type: String, label: "Region", optional: true }),
    hostname: field({ type: String, label: "Host name", optional: true }),
    language: field({ type: String, label: "Language", optional: true }),
    userAgent: field({ type: String, label: "User agent", optional: true })
  },
  { _id: false }
);

export interface IVisitorDocument extends IVistiorDoc, Document {}

export const visitorSchema = new Schema({
  integrationId: field({
    type: String,
    optional: true,
    label: "Integration"
  }),
  visitorId: field({
    type: String,
    label: "visitorId from finger print",
    optional: true,
    index: { unique: true }
  }),

  location: field({
    type: locationSchema,
    optional: true,
    label: "Location"
  }),

  isOnline: field({
    type: Boolean,
    label: "Is online",
    optional: true
  }),
  lastSeenAt: field({
    type: Date,
    label: "Last seen at",
    optional: true
  }),
  sessionCount: field({
    type: Number,
    label: "Session count",
    optional: true
  }),
  scopeBrandIds: field({
    type: [String],
    label: "Related brands",
    optional: true
  }),
  createdAt: field({ type: Date, default: Date.now })
});
