import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

dotenv.config();

const options = {
  useNewUrlParser: true,
  useCreateIndex: true
};

module.exports.up = async () => {
  const { MONGO_URL = '', INTEGRATIONS_DB_NAME = '' } = process.env;

  if (!INTEGRATIONS_DB_NAME) {
    return Promise.resolve('INTEGRATIONS_DB_NAME env not found');
  }

  const apiMongoClient = await mongoose.createConnection(MONGO_URL, options);

  const apiAccounts = apiMongoClient.db.collection('accounts');
  const apiIntegrations = apiMongoClient.db.collection('integrations');

  const accounts = await apiAccounts.find().toArray();
  const integrations = await apiIntegrations
    .aggregate([
      { $match: { facebookData: { $exists: true } } },
      {
        $project: {
          kind: 1,
          erxesApiId: '$_id',
          facebookPageIds: '$facebookData.pageIds',
          accountId: '$facebookData.accountId'
        }
      }
    ])
    .toArray();

  // Switch to erxes-integrations database
  const integrationMongoClient = apiMongoClient.useDb(INTEGRATIONS_DB_NAME);

  try {
    if (accounts && accounts.length > 0) {
      await integrationMongoClient.db
        .collection('accounts')
        .insertMany(accounts);
    }

    if (integrations && integrations.length > 0) {
      await integrationMongoClient.db
        .collection('integrations')
        .insertMany(integrations);
    }
  } catch (e) {
    console.log(e);
  }
};
