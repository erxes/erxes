import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

dotenv.config();

/**
 * Get page access token according to pageId
 *
 */
module.exports.up = async () => {
  const mongoClient = await mongoose.createConnection(process.env.MONGO_URL || '', {
    useNewUrlParser: true,
    useCreateIndex: true,
  });

  try {
    await mongoClient.db
      .collection('integrations')
      .updateMany({ kind: 'facebook' }, { $set: { kind: 'facebook-messenger' } });
  } catch (e) {
    console.log('Integration migration ', e.message);
  }

  return Promise.resolve('ok');
};
