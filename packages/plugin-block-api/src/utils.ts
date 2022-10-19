import { sendContactsMessage, sendFormsMessage } from './messageBroker';

export const getBalance = async (
  subdomain: string,
  erxesCustomerId: string
) => {
  let balance = 0;
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { _id: erxesCustomerId },
    isRPC: true,
    defaultValue: {}
  });

  const field = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: {
        code: 'balance'
      }
    },
    isRPC: true
  });

  const customFieldsData = customer.customFieldsData || [];

  if (customFieldsData.length > 0) {
    for (const customField of customFieldsData) {
      if (customField.field === field._id) {
        balance = customField.numberValue;
      }
    }
  } else {
    return balance;
  }

  return balance;
};

export const updateBalance = async (
  subdomain: string,
  erxesCustomerId: string,
  balance: number
) => {
  const field = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: {
        code: 'balance'
      }
    },
    isRPC: true
  });

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { _id: erxesCustomerId },
    isRPC: true,
    defaultValue: {}
  });

  const customFieldsData = customer.customFieldsData || [];

  if (customFieldsData.length === 0) {
    return 0;
  }

  for (const customFieldData of customFieldsData || []) {
    if (customFieldData.field === field._id) {
      customFieldData.value = balance;
      customFieldData.numberValue = balance;
      customFieldData.stringValue = balance;
    }
  }

  return sendContactsMessage({
    subdomain,
    action: 'customers.updateOne',
    data: {
      selector: {
        _id: erxesCustomerId
      },
      modifier: {
        $set: { customFieldsData }
      }
    },
    isRPC: true,
    defaultValue: {}
  });
};
