import { postsDaily, postsHourly, postsMinutely } from './posts';

export default {
  handleMinutelyJob: async ({ subdomain, models }) => {
    console.log(models);
    await postsMinutely(models, subdomain);
  },
  handleHourlyJob: async ({ subdomain, models }) => {
    await postsHourly(models, subdomain);
  },
  handleDailyJob: async ({ subdomain, models }) => {
    await postsDaily(models, subdomain);
  }
};
