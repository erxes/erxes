import { Document, Schema } from 'mongoose';

export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}

export interface IEmailSignatureDocument extends IEmailSignature, Document {}

export interface IDetail {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  position?: string;
  location?: string;
  description?: string;
  operatorPhone?: string;
}

export interface IDetailDocument extends IDetail, Document {}

export interface ILink {
  [key: string]: string;
}

export interface IUser {
  createdAt?: Date;
  code?: string;
  username?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOwner?: boolean;
  email?: string;
  getNotificationByEmail?: boolean;
  emailSignatures?: IEmailSignature[];
  starredConversationIds?: string[];
  details?: IDetail;
  links?: ILink;
  isActive?: boolean;
  brandIds?: string[];
  groupIds?: string[];
  deviceTokens?: string[];
  doNotDisturb?: string;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  emailSignatures?: IEmailSignatureDocument[];
  details?: IDetailDocument;
}

export interface IContext {
  res: any;
  requestInfo: any;
  user: IUserDocument;
  docModifier: <T>(doc: T) => any;
  brandIdSelector: {};
  userBrandIdsSelector: {};
  commonQuerySelector: {};
  commonQuerySelectorElk: {};
  singleBrandIdSelector: {};
  dataSources: {
    AutomationsAPI: any;
    EngagesAPI: any;
    IntegrationsAPI: any;
    HelpersApi: any;
  };
  dataLoaders: any;
}

export interface IColumnLabel {
  name: string;
  label: string;
}
export interface IRule {
  kind: string;
  text: string;
  condition: string;
  value: string;
}
export interface IRuleDocument extends IRule, Document {
  _id: string;
}

// schema for form's rules
export const ruleSchema = new Schema(
  {
    _id: { type: String },

    // browserLanguage, currentUrl, etc ...
    kind: { type: String, label: 'Kind' },

    // Browser language, Current url etc ...
    text: { type: String, label: 'Text' },

    // is, isNot, startsWith
    condition: { type: String, label: 'Condition' },

    value: { type: String, label: 'Value', optional: true }
  },
  { _id: false }
);

export const customFieldSchema = new Schema(
  {
    field: { type: String },
    value: { type: Schema.Types.Mixed },
    stringValue: { type: String, optional: true },
    numberValue: { type: Number, optional: true },
    dateValue: { type: Date, optional: true },
    locationValue: {
      type: {
        type: String,
        enum: ['Point'],
        optional: true
      },
      coordinates: {
        type: [Number],
        optional: true
      },
      required: false
    }
  },
  { _id: false }
);

customFieldSchema.index({ locationValue: '2dsphere' });

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
  locationValue?: ILocationOption;
}

export const attachmentSchema = new Schema(
  {
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: Number, optional: true }
  },
  { _id: false }
);

export interface IEncryptionData {
  algorithm: string;
  iv: string;
  encryptedData: string;
  key: Buffer;
}

export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
}

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}
