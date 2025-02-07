import { getConfig } from '../utils';
import { syncExchangeRate } from './exchangeRate';

export default {
  handleDailyJob: async ({ subdomain }) => {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});

    for (const config of Object.values(configs)) {
      await syncExchangeRate(subdomain, config);
    }
  },
};
