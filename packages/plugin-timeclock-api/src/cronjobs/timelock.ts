import * as dayjs from 'dayjs';
import { connectAndQueryFromMsSql } from '../utils';
import { Db, MongoClient } from 'mongodb';

const createLogWhenImportedFromMssql = async (
  queryStartTime: string,
  queryEndTime: string,
  timeclocksCreated: boolean,
  importedTimeclocksCount: number,
  errorMsg?: string
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

  const NOW = dayjs(new Date()).format('YYYY-MM-DD HH:mm');

  const r = await db
    .collection('timeclock_mssql_logs')
    .insertOne({
      createdAt: NOW,
      timeclocksCreated,
      queryStartTime,
      queryEndTime,
      errorMsg,
      importedTimeclocksCount
    })
    .catch(err => console.error(err));

  console.log('Created log at ' + NOW);
  console.log(`Imported ${importedTimeclocksCount} timeclocks`);
};

const connectAndImportFromMysql = async (subdomain: string) => {
  // get time data from yesterday till now
  const format = 'YYYY-MM-DD HH:mm:ss';
  const NOW = dayjs(Date.now());
  const YESTERDAY = NOW.add(-1, 'day');

  const returnQuery = await connectAndQueryFromMsSql(subdomain, {
    startDate: YESTERDAY.format(format),
    endDate: NOW.format(format),
    extractAll: true
  });

  if (returnQuery instanceof Error) {
    createLogWhenImportedFromMssql(
      YESTERDAY.format(format),
      NOW.format(format),
      false,
      0,
      returnQuery.message
    );

    return;
  }

  createLogWhenImportedFromMssql(
    YESTERDAY.format(format),
    NOW.format(format),
    returnQuery.length > 0,
    returnQuery.length
  );

  return returnQuery;
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await connectAndImportFromMysql(subdomain);
  }
};
