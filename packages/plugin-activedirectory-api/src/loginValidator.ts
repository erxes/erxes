import { getConfig } from './utils';
import { adSync } from './utilsAD';

export default {
  loginValidator: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    let configs;

    try {
      configs = await getConfig(subdomain, 'ACTIVEDIRECTOR', {});
      if (!configs || !Object.keys(configs).length) {
        return;
      }
    } catch (e) {
      return;
    }

    try {
      if (data.email) {
        const result = await adSync(subdomain, data.email, configs);
        return result;
      }
    } catch (e) {
      console.log(e.message);
    }
  },
};
