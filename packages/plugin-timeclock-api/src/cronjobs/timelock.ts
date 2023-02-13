import * as dayjs from 'dayjs';
import { connectAndQueryFromMsSql } from '../utils';

const connectAndImportFromMysql = (subdomain: string) => {
  // get time data from yesterday till now
  const format = 'YYYY-MM-DD HH:mm:ss';
  const NOW = dayjs(Date.now());
  const YESTERDAY = NOW.add(-1, 'day');

  return connectAndQueryFromMsSql(
    subdomain,
    YESTERDAY.format(format),
    NOW.format(format)
  );
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await connectAndImportFromMysql(subdomain);
  }
};
