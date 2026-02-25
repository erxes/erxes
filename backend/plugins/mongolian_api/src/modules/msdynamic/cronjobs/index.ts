import { getConfig } from '../utils';
import { syncExchangeRate } from './exchangeRate';

export default {
  handleDailyJob: async ({ subdomain }) => {
    let configs;

    try {
      configs = await getConfig(subdomain, 'DYNAMIC', {});
      if (!configs || !Object.keys(configs).length) {
        return;
      }
    } catch (e) {
      return;
    }

    console.log('handleDailyJob:', subdomain);

    for (const config of Object.values(configs)) {
      await syncExchangeRate(subdomain, config);
    }
  },
};
