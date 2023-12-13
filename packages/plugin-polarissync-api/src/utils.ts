import fetch from 'node-fetch';
import { sendCommonMessage } from './messageBroker';
import { Polarissyncs } from './models';

import { nanoid } from 'nanoid';

/*
 * Mongoose field options wrapper
 */
export const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => nanoid();
  }

  return options;
};

export const schemaWrapper = schema => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};

export const schemaHooksWrapper = (schema, _cacheKey: string) => {
  return schemaWrapper(schema);
};

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

    if (response.status !== 200) {
      throw new Error('Failed to fetch data');
    }

    const res = await response.json();

    if (res.errors) {
      throw new Error(res.errors[0]);
    }
    // test data
    // const res = {
    //   _id: '652f576b422e2f86a062cdfa',
    //   createdAt: '2023-10-18T03:56:27.817Z',
    //   customerId: 'BB93oqp5L5JRA98OvwwD7',
    //   updatedAt: '2023-12-08T07:01:09.931Z',
    //   data: {
    //     customer_code: 'CIF1050001299',
    //     register_number: 'УИ96100433',
    //     phone_number: '88619535',
    //     lastname: 'ЭНХБОЛД',
    //     firstname: 'ЧИЛҮГЭН',
    //     birth_date: '1996-10-04T00:00:00Z',
    //     email: 'CCHILUGEN@GMAIL.COM',
    //     facebook: 'Э.Чилүгэн',
    //     emergency_contact_phone_number: '90173889',
    //     loan_info: [
    //       {
    //         product_name: 'CREDIT CARD',
    //         adv_amount: '0',
    //         balance: '290773.04',
    //       },
    //       {
    //         product_name: 'CREDIT CARD 2',
    //         adv_amount: '10',
    //         balance: '290773.04',
    //       },
    //     ],
    //     saving_info: [
    //       {
    //         name: 'ХАГАС ЖИЛ',
    //         balance: '0',
    //       },
    //     ],
    //     investment_info: [
    //       {
    //         name: '50% өсгө',
    //         balance: '100',
    //       },
    //       {
    //         name: '100% өсгө',
    //         balance: '100',
    //       },
    //     ],
    //   },
    // };

    const fields = await sendCommonMessage({
      subdomain,
      serviceName: 'forms',
      action: 'fields.find',
      data: {
        query: {
          contentType: 'contacts:customer',
          code: { $exists: true, $ne: '' }
        },
        projection: {
          groupId: 1,
          code: 1,
          _id: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const groups = await sendCommonMessage({
      subdomain,
      serviceName: 'forms',
      action: 'fieldsGroups.find',
      data: {
        query: {
          contentType: 'contacts:customer',
          code: { $in: ['loan_info', 'saving_info', 'investment_info'] }
        },
        projection: {
          code: 1,
          _id: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const customFieldsData: any[] = [];

    const data = res.data;

    for (const f of fields) {
      if (data[f.code]) {
        customFieldsData.push({
          field: f._id,
          value: data[f.code]
        });
      }
    }

    const prepareGroupValue = (groupCode: string, prefix?: string) => {
      const group = groups.find(g => g.groupCode === 'code');

      if (group) {
        const value: any = [];
        for (const obj of data[groupCode]) {
          const fieldsOfGroup = fields.filter(f => f.groupId === group._id);
          const val = {};
          for (const f of fieldsOfGroup) {
            const code = prefix ? f.code.replace(prefix, '') : f.code;
            if (obj[code]) {
              val[f._id] = obj[code];
            }
          }
          value.push(val);
        }

        return {
          field: group._id,
          value
        };
      }
    };

    const groupCodes = ['loan_info', 'saving_info', 'investment_info'];

    for (const groupCode of groupCodes) {
      const groupValue = prepareGroupValue(groupCode);
      if (groupValue) {
        customFieldsData.push(groupValue);
      }
    }

    await sendCommonMessage({
      serviceName: 'contacts',
      action: 'customers.updateCustomer',
      data: {
        _id: customerId,
        doc: {
          state: 'customer',
          firstName: data.firstname,
          lastName: data.lastname,
          primaryEmail: res.data.email,
          birthDate: new Date(res.data.birth_date),
          code: res.data.customer_code,
          customFieldsData
        }
      },
      isRPC: true,
      defaultValue: null,
      subdomain
    });

    return Polarissyncs.createOrUpdate({
      customerId,
      data: res.data || null
    });
  } catch (e) {
    console.error('error ', e);
    throw new Error(e);
  }
};
