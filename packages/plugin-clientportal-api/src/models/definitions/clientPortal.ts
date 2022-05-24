import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IOTPConfig {
  content: string;
  smsTransporterType: '' | 'messagePro' | 'telnyx';
  emailTransporterType: '' | 'ses';
}

export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  logo?: string;
  icon?: string;
  url?: string;
  domain?: string;
  dnsStatus?: string;
  styles?: IStyles;
  mobileResponsive?: boolean;
  brandId?: string;
  otpConfig?: IOTPConfig;
}

interface IStyles {
  bodyColor?: string;
  headerColor?: string;
  footerColor?: string;
  helpColor?: string;
  backgroundColor?: string;
  activeTabColor?: string;
  baseColor?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  baseFont?: string;
  headingFont?: string;
  dividerColor?: string;
  primaryBtnColor?: string;
  secondaryBtnColor?: string;
}

export interface IClientPortalDocument extends IClientPortal, Document {
  _id: string;
}

const stylesSchema = new Schema(
  {
    bodyColor: field({ type: String, optional: true }),
    headerColor: field({ type: String, optional: true }),
    footerColor: field({ type: String, optional: true }),
    helpColor: field({ type: String, optional: true }),
    backgroundColor: field({ type: String, optional: true }),
    activeTabColor: field({ type: String, optional: true }),
    baseColor: field({ type: String, optional: true }),
    headingColor: field({ type: String, optional: true }),
    linkColor: field({ type: String, optional: true }),
    linkHoverColor: field({ type: String, optional: true }),
    dividerColor: field({ type: String, optional: true }),
    primaryBtnColor: field({ type: String, optional: true }),
    secondaryBtnColor: field({ type: String, optional: true }),
    baseFont: field({ type: String, optional: true }),
    headingFont: field({ type: String, optional: true })
  },
  {
    _id: false
  }
);

const otpConfigSchema = new Schema(
  {
    content: field({ type: String, optional: true }),
    smsTransporterType: field({
      type: String,
      enum: ['', 'messagePro', 'telnyx'],
      optional: true
    }),
    emailTransporterType: field({
      type: String,
      enum: ['', 'ses'],
      optional: true
    })
  },
  { _id: false }
);

export const clientPortalSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({ type: String, optional: true }),
  url: field({ type: String }),
  logo: field({ type: String, optional: true }),
  icon: field({ type: String, optional: true }),
  domain: field({ type: String, optional: true }),
  dnsStatus: field({ type: String, optional: true }),
  styles: field({ type: stylesSchema, optional: true }),
  mobileResponsive: field({ type: Boolean, optional: true }),
  otpConfig: field({ type: otpConfigSchema, optional: true }),
  brandId: field({ type: String, optional: true }),
  createdAt: field({ type: Date, default: new Date(), label: 'Created at' })
});
