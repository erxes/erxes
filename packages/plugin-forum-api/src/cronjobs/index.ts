import { postsDaily, postsHourly, postsMinutely } from './posts';

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    await postsMinutely(subdomain);
  },
  handleHourlyJob: async ({ subdomain }) => {
    await postsHourly(subdomain);
  },
  handleDailyJob: async ({ subdomain }) => {
    await postsDaily(subdomain);
  }
};
