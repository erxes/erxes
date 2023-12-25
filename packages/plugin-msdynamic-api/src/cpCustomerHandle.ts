import { customerToDynamic } from './utils';

export default {
  cpCustomerHandle: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    try {
      if (data.customer) {
        customerToDynamic(subdomain, data.customer);
        return;
      }

      if (data.company) {
        customerToDynamic(subdomain, data.company);
        return;
      }
    } catch (e) {
      console.log(e, 'error');
    }
  }
};
