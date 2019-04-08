import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { ActivityLogs } from '../src/db/models';

dotenv.config();

/**
 * Rename coc field to contentType
 *
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
      await ActivityLogs.updateMany({}, { $rename: { coc: 'contentType' } });

      next();
    },
  );
};
