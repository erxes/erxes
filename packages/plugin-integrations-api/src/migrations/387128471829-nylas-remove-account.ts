import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

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
    const accounts = await mongoClient.db
      .collection('accounts')
      .find({ kind: { $in: nylasKinds } })
      .toArray();

    for (const account of accounts) {
      await mongoClient.db.collection('integrations').updateOne(
        { accountId: account._id },
        {
          $set: {
            nylasToken: account.nylasToken,
            nylasBillingState: account.billingState,
            nylasAccountId: account.uid,
            emailScope: account.scope
          }
        }
      );
    }
  } catch (e) {
    console.log('Integration migration error: ', e.message);
  }

  return Promise.resolve('ok');
};
