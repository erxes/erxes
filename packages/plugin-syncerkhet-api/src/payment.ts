import { generateModels } from './connectionResolver';
import { thirdOrderToErkhet } from './utils/thirdOrders';

export default {
  transactionCallback: async ({ subdomain, data }) => {
    // TODO: implement transaction callback if necessary
  },
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (data.contentType !== 'syncerkhet:third' || data.status !== 'paid') {
      return;
    }

    await thirdOrderToErkhet(subdomain, models, data.data);
  }
};
