import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { Syncpolariss } from './models';
import { afterMutationHandlers } from './afterMutations';
import {
  consumeRPCQueue,
  consumeQueue,
} from '@erxes/api-utils/src/messageBroker';
import { createLoanSchedule } from './utils/loan/createSchedule';
import { getDepositBalance } from './utils/deposit/getDepositBalance';
import { createLoanStoreInterest } from './utils/loan/loanStoreInterest';
import { changeLoanSchedule } from './utils/loan/changeLoanSchedule';
import { getConfig } from './utils/utils';

export const setupMessageConsumers = async () => {
  consumeQueue('syncpolaris:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
  });

  consumeQueue('syncpolaris:send', async ({ data }) => {
    Syncpolariss.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('syncpolaris:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Syncpolariss.find({}),
    };
  });

  consumeRPCQueue(
    'syncpolaris:getDepositBalance',
    async ({ data, subdomain }) => {
      const polarisConfig = await getConfig(subdomain, 'POLARIS', {});
      return {
        status: 'success',
        data: await getDepositBalance(subdomain, polarisConfig, data),
      };
    },
  );

  consumeRPCQueue('syncpolaris:createSchedule', async ({ data, subdomain }) => {
    const polarisConfig = await getConfig(subdomain, 'POLARIS', {});
    return {
      status: 'success',
      data: await createLoanSchedule(subdomain, polarisConfig, data),
    };
  });

  consumeRPCQueue('syncpolaris:changeSchedule', async ({ data, subdomain }) => {
    const polarisConfig = await getConfig(subdomain, 'POLARIS', {});
    return {
      status: 'success',
      data: await changeLoanSchedule(subdomain, polarisConfig, data),
    };
  });

  consumeRPCQueue('syncpolaris:storeInterest', async ({ data, subdomain }) => {
    const polarisConfig = await getConfig(subdomain, 'POLARIS', {});
    return {
      status: 'success',
      data: await createLoanStoreInterest(subdomain, polarisConfig, data),
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};
