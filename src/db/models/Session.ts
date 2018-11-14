import { model, Schema } from 'mongoose';

export const sessionSchema = new Schema({
  createdAt: { type: Date, default: Date.now, expires: '1d' },
  invalidToken: { type: String },
});

// tslint:disable-next-line
const Session = model('session', sessionSchema);

export default Session;
