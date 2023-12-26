import { sendCommonMessage } from './messageBroker';
import fetch from 'node-fetch';
import { Polarissyncs } from './models';
import { fetchPolarisData } from './utils';

export default {
  'contacts:customer': ['create', 'update'],
  'inbox:conversation': ['create']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;
  if (type === 'inbox:conversation' && action === 'create') {
    const doc: any = params.object;

    await fetchPolarisData(subdomain, doc);
    return;
  }

  if (type === 'contacts:customer') {
    if (action === 'create') {
      const doc: any = params.object;
      doc.customerId = doc._id;

      await fetchPolarisData(subdomain, doc);
      return;
    }

    if (action === 'update') {
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

      const polarisData = await Polarissyncs.findOne({
        customerId: params.object._id
      });

      if (!polarisData) {
        return;
      }

      const body: any = {
        customer_code: polarisData.data.customer_code,
        phone_number: polarisData.data.phone_number,
        register_number: polarisData.data.register_number,
        oldData: params.object,
        updatedData: params.updatedDocument
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    }
    return;
  }
};
