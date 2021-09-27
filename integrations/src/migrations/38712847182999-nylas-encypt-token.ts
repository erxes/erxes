import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as nylasUtils from '../nylas/utils';

dotenv.config();

const nylasKinds = [
  'office365',
  'gmail',
  'outlook',
  'yahoo',
  'exchange',
  'imap'
];

/**
 * Copy nylas accessToken, refreshToken accountId, billingState to Integrations
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
    const selector = {
      $and: [
        { kind: { $in: nylasKinds } },
        { nylasToken: { $exists: true } },
        { nylasToken: { $not: { $regex: ':' } } }
      ]
    };

    const accounts = await mongoClient.db
      .collection('accounts')
      .find(selector)
      .toArray();

    for (const account of accounts) {
      await mongoClient.db.collection('accounts').updateOne(
        { _id: account._id },
        {
          $set: {
            nylasToken: nylasUtils.encryptToken(account.nylasToken)
          }
        }
      );
    }

    console.log('account counts: ', accounts.length);

    const integrations = await mongoClient.db
      .collection('integrations')
      .find(selector)
      .toArray();

    for (const integration of integrations) {
      await mongoClient.db.collection('integrations').updateOne(
        { _id: integration._id },
        {
          $set: {
            nylasToken: nylasUtils.encryptToken(integration.nylasToken)
          }
        }
      );
    }

    console.log('integration counts: ', integrations.length);
  } catch (e) {
    console.log('Integration migration error: ', e.message);
  }

  return Promise.resolve('ok');
};
