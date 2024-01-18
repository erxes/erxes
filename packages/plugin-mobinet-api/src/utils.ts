import fetch from 'node-fetch';
import { generateModels } from './connectionResolver';
import { generateFieldsFromSchema } from '@erxes/api-utils/src';

const sendSms = async (phone, message) => {
  // check message length and split then send multiple sms
  if (message.length > 160) {
    const messages = message.match(/.{1,160}/g);
    for (const msg of messages) {
      await sendSms(phone, msg);
    }
    return;
  }

  const url = `http://27.123.214.168/smsmt/mt?servicename=132222&username=132222&from=132222&to=${phone}&msg=${message}`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new Error('Failed to send sms');
  }

  const res = await response.text();

  console.log('*************** mobinet:sendSms response', res);

  if (res.includes('Sent')) {
    return 'ok';
  }

  throw new Error(res);
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { Buildings } = models;

  const schema = Buildings.schema as any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  return fields;
};

export { sendSms };
