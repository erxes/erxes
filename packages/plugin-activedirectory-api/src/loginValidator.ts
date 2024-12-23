import { adSync } from './utilsAD';

export default {
  loginValidator: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    try {
      if (data.email) {
        return await adSync(subdomain, data.email);
      }
    } catch (e) {
      return { status: false, error: `Error connecting: ${e.message}` };
    }
  },
};
