import { sendCommonMessage } from './messageBroker';
import fetch from 'node-fetch';
import { Polarissyncs } from './models';

export default {
  'contacts:customer': ['create', 'update'],
  'inbox:conversationMessage': ['create']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, object } = params;

  if (type === 'contacts:customer') {
    if (action === 'create') {
      console.log('params ', params);
      if (!object.primaryPhone) {
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
        customer_code: object.code || '',
        phone_number: object.primaryPhone,
        oldData: object,
        updatedData: params.updatedDocument
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
        customerId: object._id,
        data: res.data || null
      });
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
        customerId: object._id
      });

      if (!polarisData) {
        return;
      }

      const body: any = {
        customer_code: polarisData.data.customer_code,
        phone_number: polarisData.data.phone_number,
        register_number: polarisData.data.register_number,
        oldData: object,
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
