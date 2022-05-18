import { Document, Schema } from 'mongoose';
import { USER_LOGIN_TYPES } from './constants';

import { field } from './utils';

export interface IOTPConfig {
  content: string;
  smsTransporterType: 'messagePro' | 'twilio' | 'telnyx';
  emailTransporterType: 'ses';
}

export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  logo?: string;
  icon?: string;
  url?: string;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  ticketLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskPipelineId?: string;
  taskPublicBoardId?: string;
  taskPublicPipelineId?: string;
  taskBoardId?: string;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
  domain?: string;
  dnsStatus?: string;
  styles?: IStyles;
  mobileResponsive?: boolean;
  kbToggle?: boolean;
  publicTaskToggle?: boolean;
  ticketToggle?: boolean;
  taskToggle?: boolean;
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

export interface IUser {
  createdAt?: Date;
  password?: string;
  email?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  firstName?: string;
  lastName?: string;
  phone?: string;
  type?: string;
  companyName?: string;
  companyRegistrationNumber?: number;
  deviceTokens?: string[];
  clientPortalId: string;
  erxesCustomerId: string;
}

export interface IUserDocument extends IUser, Document {
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
      enum: ['messagePro', 'twilio', 'telnyx'],
      optional: true
    }),
    emailTransporterType: field({ type: String, enum: ['ses'], optional: true })
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
  knowledgeBaseLabel: field({ type: String, optional: true }),
  knowledgeBaseTopicId: field({ type: String }),
  ticketLabel: field({ type: String, optional: true }),
  taskPublicBoardId: field({ type: String, optional: true }),
  taskPublicPipelineId: field({ type: String, optional: true }),
  taskLabel: field({ type: String, optional: true }),
  taskStageId: field({ type: String }),
  taskPipelineId: field({ type: String }),
  taskBoardId: field({ type: String }),
  ticketStageId: field({ type: String }),
  ticketPipelineId: field({ type: String }),
  ticketBoardId: field({ type: String }),
  domain: field({ type: String, optional: true }),
  dnsStatus: field({ type: String, optional: true }),
  styles: field({ type: stylesSchema, optional: true }),
  mobileResponsive: field({ type: Boolean, optional: true }),
  createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
  kbToggle: field({ type: Boolean }),
  publicTaskToggle: field({ type: Boolean }),
  ticketToggle: field({ type: Boolean }),
  taskToggle: field({ type: Boolean }),
  otpConfig: field({ type: otpConfigSchema, optional: true })
});

export const clientPortalUserSchema = new Schema({
  type: {
    type: String,
    enum: USER_LOGIN_TYPES.ALL,
    default: USER_LOGIN_TYPES.CUSTOMER
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
      'Please fill a valid email address'
    ],
    label: 'Email'
  },
  password: { type: String },

  firstName: { type: String, optional: true },
  clientPortalId: { type: String, required: true },
  phone: { type: String, optional: true },
  lastName: { type: String, optional: true },
  resetPasswordToken: { type: String, optional: true },
  registrationToken: { type: String, optional: true },
  registrationTokenExpires: { type: Date, optional: true },
  resetPasswordExpires: { type: Date, optional: true },
  companyName: { type: String, optional: true },
  companyRegistrationNumber: { type: Number, optional: true },
  erxesCustomerId: { type: String, optional: true },
  erxesCompanyId: { type: String, optional: true },
  verificationCode: { type: String, optional: true },
  verificationCodeExpires: { type: Date, optional: true },
  verificationCodePhone: { type: String, optional: true },
  verificationCodePhoneExpires: { type: Date, optional: true },
  verificationCodeEmail: { type: String, optional: true },
  verificationCodeEmailExpires: { type: Date, optional: true },
  deviceTokens: {
    type: [String],
    default: [],
    label: 'Device tokens'
  },
  verified: { type: Boolean, optional: true, default: false }
});
