import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import { MessageArgsOmitService, sendMessage } from '@erxes/api-utils/src/core';
import { BurenScoringApi } from './burenScoringConfig/api/getScoring';
import { generateModels } from './connectionResolver';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('burenscoring:getScoring', async ({ data, subdomain }) => {
    const { customerId } = data;

    const config = await getBurenScoringConfig('burenScoringConfig', subdomain);
    if (!config) {
      throw new Error('Buren scoring config not found.');
    }

    const customer = await sendContractsMessage({
      action: 'customers.findOne',
      subdomain,
      data: { _id: customerId },
      isRPC: true,
    });

    let keyword = '';

    if (config?.field?.includes('customFieldsData.')) {
      const fieldKey = config?.field?.replace('customFieldsData.', '');
      keyword = customer.customFieldsData?.find(
        (el) => el.field == fieldKey
      )?.value;
    } else {
      keyword = customer?.[config?.field];
    }
    if (!keyword) {
      throw new Error('Register not found');
    }

    const burenConfig = new BurenScoringApi(config);

    return {
      status: 'success',
      data: await burenConfig.getScoring({
        keyword,
        reportPurpose: 'LOAN_CHECK',
        vendor: 'AND_SCORING',
      }),
    };
  });

  consumeRPCQueue(
    'burenscoring:getCustomerScore',
    async ({ data, subdomain }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.BurenScorings.findOne(data).lean(),
      };
    }
  );
};

export const getBurenScoringConfig = async (
  name: string,
  subdomain: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: [],
  });

  return configs[name];
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendContractsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};
