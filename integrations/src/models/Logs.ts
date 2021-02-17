import { Document, Model, model, Schema } from 'mongoose';
import { field } from './utils';

export interface ILog {
  type: string;
  value: any;
  specialValue: any;
}

export interface ILogDocument extends ILog, Document {
  _id: string;
}

export const logSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  value: field({ type: Object }),
  specialValue: field({ type: String })
});

export interface ILogModel extends Model<ILogDocument> {
  createLog({ type, value, specialValue }: ILog): ILogDocument;
}

export const loadClass = () => {
  class Log {
    public static async createLog({
      type,
      value,
      specialValue
    }: {
      type: string;
      value: any;
      specialValue: any;
    }) {
      return Logs.create({ type, value, specialValue });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};

loadClass();

// tslint:disable-next-line
const Logs = model<ILogDocument, ILogModel>('logs', logSchema);

export default Logs;
