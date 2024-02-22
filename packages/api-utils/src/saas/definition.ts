import * as mongoose from 'mongoose';
import { PROMO_CODE_TYPE } from '../saas/constants';

export const ORGANIZATION_PLAN = {
  LIFETIME: 'lifetime',
  FREE: 'free',
  GROWTH: 'growth',
  ALL: ['lifetime', 'free', 'growth'],
};

export const INTERVAL = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ALL: ['monthly', 'yearly'],
};

const cronLastExecutedDateSchema = new mongoose.Schema(
  {
    reset: Date,
    notify: Date,
  },
  { _id: false },
);

export const organizationsSchema = new mongoose.Schema({
  name: { type: String },
  logo: { type: String },
  icon: { type: String },
  iconColor: { type: String },
  textColor: { type: String },
  favicon: { type: String },
  description: { type: String },
  dnsStatus: { type: String },
  backgroundColor: { type: String },
  isWhiteLabel: { type: Boolean, optional: true, default: false },
  domain: { type: String },
  subdomain: { type: String },
  ownerId: { type: String },
  charge: { type: Object },
  promoCodes: { type: [String] },
  partnerKey: { type: String },
  lastActiveDate: { type: Date },
  createdAt: { type: Date },
  plan: {
    type: String,
    enum: ORGANIZATION_PLAN.ALL,
    default: ORGANIZATION_PLAN.FREE,
  },
  interval: { type: String, enum: INTERVAL.ALL, optional: true },
  subscriptionId: { type: String, optional: true },
  expiryDate: { type: Date, label: 'Expiry date', optional: true },
  cronLastExecutedDate: { type: cronLastExecutedDateSchema },
  awsSesAccountStatus: {
    type: String,
    label: 'AWS SES account status',
    optional: true,
  },
  percentOff: Number,
  amountOff: Number,
  paymentStatus: { type: String },
  paymentStatusMessage: { type: String },
  teamSize: { type: String },
  industry: { type: String },
  annualRevenue: { type: String },
  experienceId: { type: String },
  onboardingDone: { type: Boolean },
  customDomainStatus: { type: Object },

  hostNameStatus: { type: String },
  sslStatus: { type: String },
});

export const installationSchema = new mongoose.Schema({
  createdAt: { type: Date, label: 'Created at', default: new Date() },
  userId: { type: String, label: 'Owner user' },
  organizationId: { type: String, label: 'Linked organization' },
  name: { type: String, label: 'Self hosted installation name' },
  token: { type: String, label: 'Token' },
  isVerified: { type: Boolean, default: false },
  domain: { type: String, label: 'Self hosted domain' },
});

export const paymentSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  organizationId: { type: String },
  amount: { type: Number },
  invoiceId: { type: String },
});

export const userSchema = new mongoose.Schema({
  organizationIds: { type: [String] },
  email: { type: String },
});

export const endPointSchema = new mongoose.Schema({
  endPointUrl: { type: String },
});

export const PROMOCODE_STATUS = {
  REDEEMED: 'redeemed',
  REVOKED: 'revoked',
  UNUSED: 'unused',
  ALL: ['redeemed', 'revoked', 'unused'],
};

export const promoCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  status: {
    type: String,
    enum: PROMOCODE_STATUS.ALL,
    default: PROMOCODE_STATUS.UNUSED,
  },
  usedBy: { type: String, label: 'Used by' },
  usedAt: {
    type: Date,
    label: 'Used at',
  },
  type: { type: String, enum: PROMO_CODE_TYPE.ALL },
  createdBy: { type: String, label: 'Created by' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
});

export const PAYMENT_STATUS = {
  INCOMPLETE: 'incomplete',
  ERROR: 'error',
  COMPLETE: 'complete',
  CANCELED: 'canceled',
  ALL: ['canceled', 'incomplete', 'complete', 'error'],
};

export const addonSchema = new mongoose.Schema({
  kind: { type: String, label: 'Add-on kind' },
  subkind: { type: String, label: 'For example: It is used for setup service' },
  quantity: { type: Number, label: 'Quantity' },
  unitAmount: { type: Number, label: 'Unit amount' },
  installationId: { type: String, label: 'Linked installation' },
  subscriptionItemId: {
    type: String,
    label: 'Linked subscription item if purchased',
  },
  subscriptionId: { type: String, label: 'Linked subscription if purchased' },
  expiryDate: { type: Date, label: 'Expiry date if purchased' },
  createdUser: { type: String, label: 'Created user' },
  interval: String,
  percentOff: Number,
  amountOff: Number,
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUS.ALL,
    label: 'Картнаас төлбөр татагдсан тохиолдолд утга нь complete болно.',
  },
  paymentStatusMessage: {
    type: String,
    label: 'Төлбөр төлөгдсөн талаарх тайлбар',
  },
});

export const bundleSchema = new mongoose.Schema({
  name: { type: String },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  title: { type: String },
  type: { type: String },
  stripeProductId: { type: String, label: 'Product id at stripe' },
  pluginLimits: {
    type: mongoose.Schema.Types.Mixed,
    label: 'Plugins information',
  },
  comingSoon: {
    type: Boolean,
    label: 'Show different things in UI if coming soon',
  },
  isActive: { type: Boolean, label: '' },
  promoCodes: { type: [String], label: 'Promo codes' },
  description: { type: String, label: 'Description' },
  onboardingSteps: { type: [String], label: 'Onboarding steps' },
  onboardingDescription: { type: String, label: 'Onboarding description' },
  features: { type: String, label: 'Features' },
  detailedDescription: { type: String, label: 'Detailed Description' },
});

const creatorSchema = new mongoose.Schema(
  {
    name: { type: String },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  { _id: false },
);

export const PLUGIN_MAIN_TYPES = {
  ADDON: 'addon',
  PLUGIN: 'plugin',
  SERVICE: 'service',
  POWERUP: 'power-up',
  ALL: ['addon', 'plugin', 'service', 'power-up'],
};

export const pluginSchema = new mongoose.Schema({
  language: { type: String, label: 'Language' },

  avatar: { type: String, label: 'Avatar' },
  images: { type: String, label: 'Images' },
  video: { type: String, label: 'Video' },

  title: { type: String, label: 'Plugin title' },
  creator: { type: creatorSchema, label: 'Creator info' },
  department: { type: String, label: 'Department' },

  description: { type: String, label: 'Description' },
  shortDescription: { type: String, label: 'Short description' },
  screenShots: { type: String, label: 'Screen shots' },
  features: { type: String, label: 'Features' },

  tango: { type: String, label: 'Tango' },

  changeLog: { type: String, label: 'Change log' },
  lastUpdatedInfo: { type: String, label: 'Last updated information' },
  contributors: { type: String, label: 'Contributors' },
  support: { type: String, label: 'Resolved issues' },

  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },
  createdBy: { type: String, label: 'Created by' },
  modifiedBy: { type: String, label: 'Modified by' },

  selfHosted: { type: Boolean, label: 'For self hosted or not' },
  type: {
    type: String,
    label: 'Value previously stored in charge item type constant variable',
  },
  limit: { type: Number, label: 'Limit' },
  count: { type: Number, label: 'Count' },
  initialCount: { type: Number, label: 'Initial count' },
  growthInitialCount: { type: Number },
  resetMonthly: { type: Boolean, label: 'Whether limit resets monthly or not' },
  unit: { type: String, label: 'Measurement unit' },
  comingSoon: {
    type: Boolean,
    label: 'Show different things in UI if coming soon',
  },
  icon: { type: String, label: 'Icon path' },
  categories: {
    type: [String],
    label: 'Related categories (marketing, sales ...etc)',
  },
  dependencies: { type: [String], label: 'Dependent plugin ids' },
  mainType: {
    type: [String],
    label: 'Whether a plugin, addon, service or power-up',
    enum: PLUGIN_MAIN_TYPES.ALL,
  },
  stripeProductId: { type: String, label: 'Product id at stripe' },
});

export const experiencesSchema = new mongoose.Schema({
  title: { type: String },
  images: { type: String, label: 'images' },
  video: { type: String, label: 'video' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  stripeProductId: { type: String, label: 'Product id at stripe' },
  pluginLimits: {
    type: mongoose.Schema.Types.Mixed,
    label: 'Plugins information',
  },
  comingSoon: {
    type: Boolean,
    label: 'Show different things in UI if coming soon',
  },
  isPrivate: {
    type: Boolean,
    label: 'Show different things in UI if coming soon',
  },
  isActive: { type: Boolean, label: '' },
  promoCodes: { type: [String], label: 'Promo codes' },
  description: { type: String, label: 'Description' },
  onboardingSteps: { type: [String], label: 'Onboarding steps' },
  onboardingDescription: { type: String, label: 'Onboarding description' },
  features: { type: String, label: 'Features' },
});
