import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Polarissyncs } from './models';
import { afterMutationHandlers } from './afterMutations';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('polarissync:send', async ({ data }) => {
    Polarissyncs.send(data);

    return {
      status: 'success'
    };
  });

  consumeQueue('polarissync:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue('polarsync:fetchCustomer', async ({ subdomain, data }) => {
    const { customer } = data;

    if (!customer || !customer.primaryPhone) {
      return;
    }

    const configs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'POLARIS_API_URL'
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!configs) {
      return;
    }

    const url = `${configs.value}/user/update`;

    const body: any = {
      customer_code: customer.code || '',
      phone_number: customer.primaryPhone,

      updatedData: customer
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const res = await response.json();

    console.log('res ', res);

    if (res.errors) {
      throw new Error(res.errors[0]);
    }

    return Polarissyncs.createOrUpdate({
      customerId: customer._id,
      data: res.data || null
    });
  });

  consumeRPCQueue('polarissync:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Polarissyncs.find({})
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
