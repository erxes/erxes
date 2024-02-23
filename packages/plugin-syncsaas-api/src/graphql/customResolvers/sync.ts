import fetch from 'node-fetch';
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

    let response;

    try {
      response = await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
        headers: {
          origin: `${subdomain}..app.erxes.io`,
        },
      }).then((res) => res.json());
    } catch (error) {
      return null;
    }

    return response ? response : null;
  },

  async customersDetail(parent, args, { models }: IContext, info) {
    const { variableValues } = info;

    const { customerId, customerIds, status, excludeCustomerIds } =
      variableValues || {};

    let selector: any = {
      $or: [{ customerId }, { customerId: { $in: customerIds } }],
    };

    if (status) {
      selector.status = status;
    }

    if (!!excludeCustomerIds?.length) {
      selector.customerId = {
        $nin: excludeCustomerIds,
      };
    }

    return await models.SyncedCustomers.find(selector);
  },
};
