import { getConfig } from '../utils';
import { syncExchangeRate } from './exchangeRate';

export default {
  handleDailyJob: async ({ subdomain }) => {
    const config = await getConfig(subdomain, 'DYNAMIC_EXCHANGE_RATE', {});

    await syncExchangeRate(subdomain, config);
  },
};
