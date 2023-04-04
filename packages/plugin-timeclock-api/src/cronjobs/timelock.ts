import * as dayjs from 'dayjs';
import { connectAndQueryFromMsSql } from '../utils';
import { Db, MongoClient } from 'mongodb';
import * as assert from 'assert';

const createLogWhenImportedFromMssql = async (
  importedTimeclocksCount: string
) => {
  let db: Db;

  const { MONGO_URL } = process.env;

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  await client.connect();
  console.log('Connected to mongo server');

  db = client.db('erxes') as Db;

  const NOW = new Date();

  // Insert importedQueryCount, importedTime into timeclock_mssql_logs collection
  const r = await db
    .collection('timeclock_mssql_logs')
    .insertOne({ importedTime: NOW, importedTimeclocksCount });

  assert.equal(1, r.insertedCount);

  console.log('Created log at ' + NOW);
  console.log(`Imported ${importedTimeclocksCount} timeclocks`);
};

const connectAndImportFromMysql = async (subdomain: string) => {
  // get time data from yesterday till now
  const format = 'YYYY-MM-DD HH:mm:ss';
  const NOW = dayjs(Date.now());
  const YESTERDAY = NOW.add(-1, 'day');

  const returnQuery = await connectAndQueryFromMsSql(
    subdomain,
    YESTERDAY.format(format),
    NOW.format(format)
  );

  createLogWhenImportedFromMssql(returnQuery.length);

  return returnQuery;
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await connectAndImportFromMysql(subdomain);
  }
};
