import fetch from 'node-fetch';
import { sendCommonMessage } from './messageBroker';
import { Polarissyncs } from './models';

export const fetchPolarisData = async (subdomain: string, doc: any) => {
  const customerId = doc.customerId;

  const customer = await sendCommonMessage({
    serviceName: 'contacts',
    action: 'customers.findOne',
    data: { _id: customerId },
    isRPC: true,
    defaultValue: null,
    subdomain
  });

  if (!customer) {
    throw new Error('Customer not found');
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
    throw new Error('Config not found');
  }

  const body: any = {
    customer_code: '',
    phone_number: '',
    register_number: ''
  };

  if (customer.primaryPhone) {
    body.phone_number = customer.primaryPhone;
  }

  if (customer.code) {
    body.customer_code = customer.code;
  }

  try {
    const url = `${configs.value}/user/info`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const res = await response.json();

    if (res.errors) {
      throw new Error(res.errors[0]);
    }

    console.log('res', res);

    console.log('customer.state', customer.state);

    if (customer.state !== 'customer') {
      await sendCommonMessage({
        serviceName: 'contacts',
        action: 'customers.updateCustomer',
        data: {
          _id: customerId,
          doc: {
            state: 'customer',
            firstName: res.data.firstname,
            lastName: res.data.lastname,
            primaryEmail: res.data.email,
            birthDate: new Date(res.data.birth_date),
            code: res.data.customer_code
          }
        },
        isRPC: true,
        defaultValue: null,
        subdomain
      });
    }

    return Polarissyncs.createOrUpdate({
      customerId,
      data: res.data || null
    });
  } catch (e) {
    console.error('error ', e);
    throw new Error(e);
  }
};
