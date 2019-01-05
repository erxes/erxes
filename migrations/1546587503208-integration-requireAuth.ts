import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { Integrations } from '../src/db/models';

dotenv.config();

/**
 * Updating messenger integration's require auth to true
 *
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
      await Integrations.updateMany({ kind: 'messenger' }, { $set: { 'messengerData.requireAuth': true } });

      next();
    },
  );
};
