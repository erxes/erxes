import { generateModels } from '../connectionResolver';
import { syncExchangeRate } from './exchangeRate';

export default {
  handleDailyJob: async ({ subdomain }) => {
    const models = await generateModels(subdomain);
    await syncExchangeRate(subdomain, models);
  },
};
