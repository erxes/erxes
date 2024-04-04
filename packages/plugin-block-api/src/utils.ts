import { sendContactsMessage, sendFormsMessage } from './messageBroker';
import { sendCoreMessage } from './messageBroker';
import fetch from 'node-fetch';
import { debugError } from '@erxes/api-utils/src/debuggers';

export const getBalance = async (
  subdomain: string,
  erxesCustomerId: string,
) => {
  let balance = 0;
  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { _id: erxesCustomerId },
    isRPC: true,
    defaultValue: {},
  });

  const field = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: {
        code: 'balance',
      },
    },
    isRPC: true,
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
  balance: number,
) => {
  const field = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: {
        code: 'balance',
      },
    },
    isRPC: true,
  });

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: { _id: erxesCustomerId },
    isRPC: true,
    defaultValue: {},
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
        _id: erxesCustomerId,
      },
      modifier: {
        $set: { customFieldsData },
      },
    },
    isRPC: true,
    defaultValue: {},
  });
};

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string,
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: [],
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const sendSms = async (
  subdomain: string,
  phoneNumber: string,
  content: string,
) => {
  const MESSAGE_PRO_API_KEY = await getConfig(
    'MESSAGE_PRO_API_KEY',
    subdomain,
    '',
  );

  const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
    'MESSAGE_PRO_PHONE_NUMBER',
    subdomain,
    '',
  );

  if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
    throw new Error('messagin config not set properly');
  }

  try {
    await fetch(
      'https://api.messagepro.mn/send?' +
        new URLSearchParams({
          key: MESSAGE_PRO_API_KEY,
          from: MESSAGE_PRO_PHONE_NUMBER,
          to: phoneNumber,
          text: content,
        }),
    );

    return 'sent';
  } catch (e) {
    debugError(e.message);
    throw new Error(e.message);
  }
};

export const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
