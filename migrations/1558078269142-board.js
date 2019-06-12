import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { Boards, Pipelines, Stages } from '../src/db/models';

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
      try {
        await mongoose.connection.db.collection('deal_boards').rename('boards');

        await Boards.updateMany({}, { $set: { type: 'deal' } });
  
        await mongoose.connection.db.collection('deal_pipelines').rename('pipelines');
  
        await Pipelines.updateMany({}, { $set: { type: 'deal' } });
  
        await mongoose.connection.db.collection('deal_stages').rename('stages');
  
        await Stages.updateMany({}, { $set: { type: 'deal' } });
      } catch(e) {
        console.log('board migration: ', e); 
      }

      next();
    },
  );
};
