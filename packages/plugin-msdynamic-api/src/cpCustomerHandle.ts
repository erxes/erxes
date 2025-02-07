import { generateModels } from './connectionResolver';
import { getConfig } from './utils';
import { customerToDynamic } from './utilsCustomer';

export default {
  cpCustomerHandle: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    let configs;

    try {
      configs = await getConfig(subdomain, 'DYNAMIC', {});
      if (!configs || !Object.keys(configs).length) {
        return;
      }
    } catch (e) {
      return;
    }

    const models = await generateModels(subdomain);

    const syncLogDoc = {
      type: '',
      contentType: data.customer ? 'core:customer' : 'core:company',
      contentId: data.customer ? data.customer?._id : data.company?._id,
      createdAt: new Date(),
      consumeData: data,
      consumeStr: JSON.stringify(data),
    };

    let syncLog;

    try {
      if (data.customer) {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        await customerToDynamic(
          subdomain,
          syncLog,
          data.customer,
          'customer',
          models,
          configs
        );
        return;
      }

      if (data.company) {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        await customerToDynamic(
          subdomain,
          syncLog,
          data.company,
          'company',
          models,
          configs
        );
        return;
      }
    } catch (e) {
      console.log(e.message);
    }
  },
};
