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
  ALL: ['valid', 'invalid', 'accept_all_unverifiable', 'unknown', 'disposable', 'catchall', 'badsyntax'],
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

export const loadClass = () => {
  class Email {
    public static createEmail(doc: IEmail) {
      return Emails.create(doc);
    }
  }

  emailSchema.loadClass(Email);
};

loadClass();

// tslint:disable-next-line
export const Emails = model<IEmailDocument, IEmailModel>('emails', emailSchema);
