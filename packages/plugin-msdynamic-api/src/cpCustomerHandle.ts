import { generateModels } from './connectionResolver';
import { customerToDynamic } from './utils';

export default {
  cpCustomerHandle: async ({ subdomain, data }) => {
    if (!data) {
      return;
    }

    const models = await generateModels(subdomain);

    const syncLogDoc = {
      contentType: data?.customer ? 'contacts:customer' : 'contacts:company',
      contentId: data._id,
      createdAt: new Date(),
      consumeData: data,
      consumeStr: JSON.stringify(data)
    };

    let syncLog;

    try {
      if (data.customer) {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        customerToDynamic(subdomain, syncLog, data.customer, models);
        return;
      }

      if (data.company) {
        syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

        customerToDynamic(subdomain, syncLog, data.company, models);
        return;
      }
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
    }
  }
};
