import { sendCommonMessage, sendContactsMessage } from '../messageBroker';

export const getCustomer = async (req, res, subdomain) => {
  const phoneNumber = req.query.phone;

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      primaryPhone: phoneNumber
    },
    isRPC: true,
    defaultValue: null
  });

  if (!customer) {
    res.json({
      status: 'error',
      message: 'Customer not found'
    });
  }
  const customFields: any = {};

  customFields.firstName = customer.firstName;
  customFields.lastName = customer.lastName;
  customFields.cellular = customer.primaryPhone;
  customFields.e_mail = customer.primaryEmail;

  const fieldIds = (customer.customFieldsData || []).map(d => d.field);

  const fields = await sendCommonMessage({
    subdomain: 'os',
    data: {
      query: {
        _id: { $in: fieldIds }
      }
    },
    serviceName: 'forms',
    action: 'fields.find',
    isRPC: true,
    defaultValue: []
  });

  for (const customFieldData of customer.customFieldsData || []) {
    const field = fields.find(f => f._id === customFieldData.field);

    if (field) {
      if (field) {
        customFields[field.code] = customFieldData.value;
      }
    }
  }

  return res.json(customFields);
};

export const createCustomer = async (req, res, subdomain) => {
  const { body } = req;

  return res.send('ok');
};
