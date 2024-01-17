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

    const response = await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
      headers: {
        origin: `${subdomain}..app.erxes.io`,
      },
    }).then((res) => res.json());

    return response ? response : null;
  },

  async syncedCustomerId(
    { _id, syncId, customerId },
    args,
    { models }: IContext,
  ) {
    let selector = { syncId: _id, customerId };

    if (syncId) {
      selector.syncId = syncId;
    }

    const syncedCustomer = await models.SyncedCustomers.findOne(selector);

    return syncedCustomer ? syncedCustomer.syncedCustomerId : null;
  },

  async customerStatus({ customerId }, {}, { models }: IContext) {
    const syncedCustomer = await models.SyncedCustomers.findOne({ customerId });

    return syncedCustomer ? syncedCustomer?.status : null;
  },
};
