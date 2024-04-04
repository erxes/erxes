import { generateModels } from '../db/models';
import { postsDaily, postsHourly, postsMinutely } from './posts';

export default {
  handleMinutelyJob: async ({ subdomain }) => {
    const models = await generateModels(subdomain);
    await postsMinutely(subdomain, models);
  },
  handleHourlyJob: async ({ subdomain }) => {
    const models = await generateModels(subdomain);
    await postsHourly(subdomain, models);
  },
  handleDailyJob: async ({ subdomain }) => {
    const models = await generateModels(subdomain);
    await postsDaily(subdomain, models);
  }
};
