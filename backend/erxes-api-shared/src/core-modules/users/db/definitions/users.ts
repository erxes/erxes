import { Schema } from 'mongoose';
import { mongooseField, schemaWrapper } from '../../../../utils';

import { customFieldSchema } from '../../../common/db/definitions/common';
import { USER_MOVEMENT_STATUSES, USER_ROLES } from '../../constants';

enum IUserChatStatus {
  online = 'online',
  offline = 'offline',
}

// Mongoose schemas ===============================
const emailSignatureSchema = new Schema(
  {
    brandId: mongooseField({ type: String, label: 'Email signature brand' }),
    signature: mongooseField({ type: String, label: 'Email signature' }),
  },
  { _id: false },
);

// Detail schema
const detailSchema = new Schema(
  {
    avatar: mongooseField({ type: String, label: 'Avatar' }),
    coverPhoto: mongooseField({ type: String, label: 'Cover photo' }),
    shortName: mongooseField({
      type: String,
      optional: true,
      label: 'Short name',
    }),
    fullName: mongooseField({ type: String, label: 'Full name' }),
    birthDate: mongooseField({ type: Date, label: 'Birth date' }),
    workStartedDate: mongooseField({
      type: Date,
      label: 'Date to joined to work',
    }),
    position: mongooseField({ type: String, label: 'Position' }),
    location: mongooseField({
      type: String,
      optional: true,
      label: 'Location',
    }),
    description: mongooseField({
      type: String,
      optional: true,
      label: 'Description',
    }),
    operatorPhone: mongooseField({
      type: String,
      optional: true,
      label: 'Operator phone',
    }),
    firstName: mongooseField({ type: String, label: 'First name' }),
    middleName: mongooseField({ type: String, label: 'Middle name' }),
    lastName: mongooseField({ type: String, label: 'Last name' }),
  },
  { _id: false },
);

// User schema
export const userSchema = schemaWrapper(
  new Schema({
    _id: mongooseField({ pkey: true }),
    createdAt: mongooseField({
      type: Date,
      default: Date.now,
      label: 'Created at',
    }),
    username: mongooseField({ type: String, label: 'Username' }),
    password: mongooseField({ type: String, optional: true }),
    resetPasswordToken: mongooseField({ type: String }),
    registrationToken: mongooseField({ type: String }),
    registrationTokenExpires: mongooseField({ type: Date }),
    resetPasswordExpires: mongooseField({ type: Date }),
    isOwner: mongooseField({ type: Boolean, label: 'Is owner' }),
    onboardedPlugins: mongooseField({
      type: [String],
      label: 'Onboarded plugins',
      default: [],
    }),
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    departmentIds: mongooseField({ type: [String], label: 'Department Ids' }),
    branchIds: mongooseField({ type: [String], label: 'Branch Ids' }),
    positionIds: mongooseField({ type: [String], label: 'Position Ids' }),
    email: mongooseField({
      type: String,
      unique: true,
      /**
       * RFC 5322 compliant regex. Taken from http://emailregex.com/
       */
      match: [
        /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/,
        'Please fill a valid email address',
      ],
      label: 'Email',
    }),
    getNotificationByEmail: mongooseField({
      type: Boolean,
      label: 'Get notification by email',
    }),
    emailSignatures: mongooseField({
      type: [emailSignatureSchema],
      label: 'Email signatures',
    }),
    starredConversationIds: mongooseField({
      type: [String],
      label: 'Starred conversations',
    }),
    details: mongooseField({
      type: detailSchema,
      default: {},
      label: 'Details',
    }),
    links: mongooseField({ type: Object, default: {}, label: 'Links' }),
    isActive: mongooseField({
      type: Boolean,
      default: true,
      label: 'Is active',
    }),
    brandIds: mongooseField({ type: [String], label: 'Brands' }),
    groupIds: mongooseField({ type: [String], label: 'Groups' }),
    deviceTokens: mongooseField({
      type: [String],
      default: [],
      label: 'Device tokens',
    }),
    code: mongooseField({ type: String }),
    doNotDisturb: mongooseField({
      type: String,
      optional: true,
      default: 'No',
      label: 'Do not disturb',
    }),
    isSubscribed: mongooseField({
      type: String,
      optional: true,
      default: 'Yes',
      label: 'Subscribed',
    }),
    isShowNotification: mongooseField({
      type: Boolean,
      optional: true,
      default: false,
      label: 'Check if user shows',
    }),
    score: mongooseField({
      type: Number,
      optional: true,
      label: 'Score',
      esType: 'number',
      default: 0,
    }),

    role: mongooseField({
      type: String,
      label: 'User role',
      optional: true,
      default: USER_ROLES.USER,
      enum: USER_ROLES.ALL,
    }),

    appId: mongooseField({
      type: String,
      label: 'Linked app id',
      optional: true,
    }),
    employeeId: mongooseField({
      type: String,
      unique: true,
      optional: true,
      sparse: true,
    }),
    chatStatus: mongooseField({
      type: String,
      enum: Object.values(IUserChatStatus),
      optional: true,
      label: 'User chat status /used for exm/',
    }),
    customFieldsData: mongooseField({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data',
    }),
    propertiesData: mongooseField({
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Properties data',
    }),
    lastSeenAt: mongooseField({
      type: Date,
      optional: true,
      label: 'Last seen at',
    }),
  }),
);

export const userMovemmentSchema = schemaWrapper(
  new Schema({
    _id: mongooseField({ pkey: true }),
    contentType: mongooseField({ type: String, label: 'Content Type' }),
    contentTypeId: mongooseField({ type: String, label: 'Content Type Id' }),
    userId: mongooseField({ type: String, label: 'User Id' }),
    createdBy: mongooseField({ type: String, label: 'Created By' }),
    isActive: mongooseField({ type: Boolean, label: 'Is Active' }),
    status: mongooseField({
      type: String,
      label: 'User Movement Status',
      default: USER_MOVEMENT_STATUSES.CREATED,
    }),
    createdAt: mongooseField({
      type: Date,
      label: 'Created At',
      default: Date.now,
    }),
  }),
);
