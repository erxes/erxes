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

    const customFieldsData: any[] = customer.customFieldsData || [];

    const data = res.data;

    for (const f of fields) {
      const existingIndex = customFieldsData.findIndex(c => c.field === f._id);

      if (data[f.code]) {
        if (existingIndex !== -1) {
          // replace existing value
          customFieldsData[existingIndex].value = data[f.code];
        } else {
          customFieldsData.push({
            field: f._id,
            value: data[f.code]
          });
        }
      }
    }

    const prepareGroupValue = (groupCode: string, prefix?: string) => {
      const group = groups.find(g => g.code === groupCode);

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

    const groupCodes = [
      { code: 'loan_info' },
      { code: 'saving_info', prefix: 'saving_' },
      { code: 'investment_info', prefix: 'invest_' }
    ];

    for (const g of groupCodes) {
      const groupValue = prepareGroupValue(g.code, g.prefix);
      if (groupValue) {
        const existingIndex = customFieldsData.findIndex(
          c => c.field === groupValue.field
        );

        if (existingIndex !== -1) {
          // replace existing value
          customFieldsData[existingIndex].value = groupValue.value;
        } else {
          customFieldsData.push(groupValue);
        }
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
