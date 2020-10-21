import * as mongoose from 'mongoose';
import { Boards, Pipelines, Stages } from '../db/models';

/**
 * Rename coc field to contentType
 *
 */
module.exports.up = async () => {
  const mongoClient = await mongoose.createConnection(process.env.MONGO_URL || '', {
    useNewUrlParser: true,
    useCreateIndex: true,
  });

  try {
    await mongoClient.db.collection('deal_boards').rename('boards');

    await Boards.updateMany({}, { $set: { type: 'deal' } });

    await mongoClient.db.collection('deal_pipelines').rename('pipelines');

    await Pipelines.updateMany({}, { $set: { type: 'deal' } });

    await mongoClient.db.collection('deal_stages').rename('stages');

    await Stages.updateMany({}, { $set: { type: 'deal' } });
  } catch (e) {
    console.log('board migration ', e.message);
  }

  return Promise.resolve('ok');
};
