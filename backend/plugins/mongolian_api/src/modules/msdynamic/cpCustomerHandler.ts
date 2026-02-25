import { generateModels } from '~/connectionResolvers';
import { customerToDynamic } from './utilsCustomer';

const getDynamicConfigsMap = async (models: any) => {
  const configs = await models.Configs.getConfigs('DYNAMIC');

  if (!configs?.length) {
    return null;
  }

  return configs.reduce((acc: any, conf: any) => {
    acc[conf.subId || 'noBrand'] = conf.value;
    return acc;
  }, {});
};

export default {
  cpCustomerHandle: async ({
    subdomain,
    data,
  }: {
    subdomain: string;
    data: any;
  }) => {
    if (!data?.customer && !data?.company) {
      return;
    }

    const models = await generateModels(subdomain);

    const configsMap = await getDynamicConfigsMap(models);

    if (!configsMap) {
      return;
    }

    const contentType = data.customer ? 'core:customer' : 'core:company';

    const entity = data.customer || data.company;
    const brandId = entity?.scopeBrandIds?.[0];

    const config = configsMap[brandId || 'noBrand'];

    if (!config) {
      return;
    }

    console.log('cpCustomerHandle:', contentType, entity?._id);

    const syncLogDoc = {
      type: '',
      contentType,
      contentId: entity?._id,
      createdAt: new Date(),
      consumeData: data,
      consumeStr: JSON.stringify(data),
    };

    let syncLog;

    try {
      syncLog = await models.SyncLogs.syncLogsAdd(syncLogDoc);

      await customerToDynamic(
        subdomain,
        syncLog,
        entity,
        data.customer ? 'customer' : 'company',
        models,
        config,
      );
    } catch (e: any) {
      console.log(e?.message || e);
      if (syncLog?._id) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e?.message || 'Unknown error' } },
        );
      }
    }
  },
};
