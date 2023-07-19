import { sendRequest } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Sync.findOne({ _id });
  },

  async organizationDetail({ subdomain }) {
    const { SAAS_CORE_URL } = process.env;

    if (!SAAS_CORE_URL) {
      return null;
    }

    const response = await sendRequest({
      url: `${SAAS_CORE_URL}/check-subdomain`,
      method: 'GET',
      headers: {
        origin: `${subdomain}..app.erxes.io`
      }
    });

    return response ? response : null;
  }
};
