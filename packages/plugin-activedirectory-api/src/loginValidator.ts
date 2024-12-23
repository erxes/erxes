import { getConfig } from './utils';
import { adSync } from './utilsAD';

export default {
  loginValidator: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    try {
      if (data.email) {
        const result = await adSync(subdomain, data.email);
        return result;
      }
    } catch (e) {
      console.log(e.message);
    }
  },
};
