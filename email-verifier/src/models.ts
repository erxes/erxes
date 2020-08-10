import { Document, Model, model, Schema } from 'mongoose';

export const EMAIL_VALIDATION_STATUSES = {
  VALID: 'valid',
  INVALID: 'invalid',
  ACCEPT_ALL_UNVERIFIABLE: 'accept_all_unverifiable',
  UNKNOWN: 'unknown',
  DISPOSABLE: 'disposable',
  CATCHALL: 'catchall',
  BAD_SYNTAX: 'badsyntax',
  UNVERIFIABLE: 'unverifiable',
  NOT_CHECKED: 'Not checked',
  ALL: [
    'valid',
    'invalid',
    'accept_all_unverifiable',
    'unknown',
    'disposable',
    'catchall',
    'badsyntax',
    'unverifiable',
    'Not checked',
  ],
};

export const PHONE_VALIDATION_STATUSES = {
  VALID: 'valid',
  INVALID: 'invalid',
  UNKNOWN: 'unknown',
  RECEIVES_SMS: 'receives_sms',
  UNVERIFIABLE: 'unverifiable',
  ALL: ['valid', 'invalid', 'unknown', 'receives_sms', 'unverifiable'],
};

export const EMAIL_VALIDATION_SOURCES = {
  ERXES: 'erxes',
  TRUEMAIL: 'truemail',
  ALL: ['erxes', 'truemail'],
};

interface IEmail {
  email: string;
  status: string;
}

interface IEmailDocument extends IEmail, Document {
  _id: string;
}

const emailSchema = new Schema({
  email: { type: String, unique: true },
  status: { type: String, enum: EMAIL_VALIDATION_STATUSES.ALL },
  created: { type: Date, default: Date.now() },
});

interface IEmailModel extends Model<IEmailDocument> {
  createEmail(doc: IEmail): Promise<IEmailDocument>;
}

interface IPhone {
  phone: string;
  status: string;
  lineType?: string;
  carrier?: string;
  localFormat?: string;
  internationalFormat?: string;
}

interface IPhoneDocument extends IPhone, Document {
  _id: string;
}

const phoneSchema = new Schema({
  phone: { type: String, unique: true },
  status: { type: String, enum: PHONE_VALIDATION_STATUSES.ALL },
  lineType: { type: String, optional: true },
  carrier: { type: String, optional: true },
  localFormat: { type: String, optional: true },
  internationalFormat: { type: String, optional: true },
  created: { type: Date, default: Date.now() },
});

interface IPhoneModel extends Model<IPhoneDocument> {
  createPhone(doc: IPhone): Promise<IPhoneDocument>;
}

export const loadClass = () => {
  class Email {
    public static createEmail(doc: IEmail) {
      return Emails.create(doc);
    }
  }

  emailSchema.loadClass(Email);

  class Phone {
    public static createPhone(doc: IPhone) {
      return Phones.create(doc);
    }
  }

  phoneSchema.loadClass(Phone);
};

loadClass();

// tslint:disable-next-line
export const Emails = model<IEmailDocument, IEmailModel>('emails', emailSchema);

// tslint:disable-next-line:variable-name
export const Phones = model<IPhoneDocument, IPhoneModel>('phones', phoneSchema);
