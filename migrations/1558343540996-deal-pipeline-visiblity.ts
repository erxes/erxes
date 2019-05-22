import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { DealPipelines } from '../src/db/models';

dotenv.config();

module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
      await DealPipelines.updateMany({}, { $set: { visiblity: 'public' } });

      next();
    },
  );
};
