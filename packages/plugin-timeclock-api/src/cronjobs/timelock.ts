import * as dayjs from 'dayjs';
import { getEnv } from '@erxes/api-utils/src';
import { connectAndQueryFromMySql } from '../utils';

const connectAndImportFromMysql = async (subdomain: string) => {
  const MYSQL_TABLE = getEnv({ name: 'MYSQL_TABLE' });

  // get time data from yesterday till now
  const format = 'YYYY-MM-DD HH:mm:ss';
  const NOW = dayjs(Date.now());
  const YESTERDAY = NOW.add(-1, 'day');

  const query =
    'SELECT * FROM ' +
    MYSQL_TABLE +
    " WHERE authDateTime >= '" +
    YESTERDAY.format(format) +
    "' AND authDateTime < '" +
    NOW.format(format) +
    "' ORDER by ID, authDateTime";

  return await connectAndQueryFromMySql(subdomain, query);
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await connectAndImportFromMysql(subdomain);
  }
};
