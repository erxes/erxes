import { sendFormsMessage } from './../../../plugin-inbox-api/src/messageBroker';
import { sendContactsMessage } from '../messageBroker';

export const getCustomer = async (subdomain: string, req, res) => {
  const { phone } = req.queryParams;

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      primaryPhone: phone
    },
    isRPC: true,
    defaultValue: null
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  const fields = await sendFormsMessage({
    subdomain,
    action: 'fields',
    data: {
      contentType: 'contacts:customer'
    },
    isRPC: true,
    defaultValue: []
  });

  const customerObj: any = {};

  for (const data of customer.customFieldsData) {
    const field = fields.find(f => f._id === data.fieldId);

    if (field) {
      customerObj[field.code] = data.value;
    }
  }

  return res.json(customerObj);
};

export const createCustomer = async (subdomain: string, req, res) => {
  const { body } = req;

  return res.send('ok');
};
