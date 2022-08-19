import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { getPageAccessToken } from '../facebook/utils';

dotenv.config();

/**
 * Get page access token according to pageId
 *
 */
module.exports.up = async () => {
  const mongoClient = await mongoose.createConnection(
    process.env.MONGO_URL || '',
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  );

  try {
    const integrations = await mongoClient.db
      .collection('integrations')
      .find({
        kind: { $eq: 'facebook' },
        facebookPageTokensMap: { $exists: false }
      })
      .toArray();

    for (const integration of integrations) {
      const facebookPageTokensMap = {};
      const account = await mongoClient.db
        .collection('accounts')
        .findOne({ _id: integration.accountId });

      for (const pageId of integration.facebookPageIds) {
        facebookPageTokensMap[pageId] = await getPageAccessToken(
          pageId,
          account.token
        );
      }

      await mongoClient.db
        .collection('integrations')
        .updateOne(
          { _id: integration._id },
          { $set: { facebookPageTokensMap } }
        );
    }
  } catch (e) {
    console.log('Integration migration ', e.message);
  }

  return Promise.resolve('ok');
};
