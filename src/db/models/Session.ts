import { Document, model, Model, Schema } from 'mongoose';

export const sessionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, expires: '1d' },
  invalidToken: { type: String },
});

export interface ISession {
  createdAt: Date;
  invalidToken: string;
}

export interface ISessionDocument extends ISession, Document {
  _id: string;
}

export interface ISessionModel extends Model<ISessionDocument> {}

export const loadClass = () => {
  return sessionSchema;
};

loadClass();

// tslint:disable-next-line
const Session = model('session', sessionSchema);

export default Session;
