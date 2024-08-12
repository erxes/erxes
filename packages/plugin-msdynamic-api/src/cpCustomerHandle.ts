import { generateModels } from './connectionResolver';
import { customerToDynamic } from './utilsCustomer';

export default {
  cpCustomerHandle: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    const models = await generateModels(subdomain);

    try {
      if (data.customer) {
        customerToDynamic(subdomain, data.customer, models);
        return;
      }

      if (data.company) {
        customerToDynamic(subdomain, data.company, models);
        return;
      }
    } catch (e) {
      console.log(e.message)
    }
  }
};
