import { logsSchema } from 'erxes-api-shared/core-modules';
import { ILogDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';

export interface ILogModel extends Model<ILogDocument> {}

export const loadLogsClass = (models) => {
  class Logs {}

  logsSchema.loadClass(Logs);

  return logsSchema;
};
