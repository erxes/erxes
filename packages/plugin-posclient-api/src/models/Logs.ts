import * as mongoose from 'mongoose';
import { Model, model } from 'mongoose';

import { ILog, ILogDocument, logSchema } from './definitions';

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILog): Promise<ILogDocument>;
}

export const loadLogClass = models => {
  class Log {
    public static async createLog(doc: ILog) {
      const log = await models.Logs.create(doc);

      return log._id;
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};

// tslint:disable-next-line
delete mongoose.connection.models['logs'];

// tslint:disable-next-line
const Logs = model<ILogDocument, ILogModel>('logs', logSchema);

export default Logs;
