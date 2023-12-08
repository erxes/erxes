import { findUnfinishedShiftsAndUpdate } from '../utils';
import { Db, MongoClient } from 'mongodb';
import * as dayjs from 'dayjs';

const updateTimeclocks = async (subdomain: any) => {
  let db: Db;

  const { MONGO_URL } = process.env;

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  await client.connect();
  console.log('Connected to mongo server');

  db = client.db('erxes') as Db;

  const NOW = dayjs(new Date()).format('YYYY-MM-DD HH:mm');

  const bulkWriteResult = await findUnfinishedShiftsAndUpdate(subdomain);

  if (bulkWriteResult) {
    await db
      .collection('bichil_unfinished_shifts')
      .insertOne({
        createdAt: NOW,
        totalCount: bulkWriteResult.modifiedCount
      })
      .catch(async err => {
        console.error(err);
        await db.collection('bichil_unfinished_shifts').insertOne({ err });
      });
  }

  console.log('Created log at ' + NOW);
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await updateTimeclocks(subdomain);
  }
};
