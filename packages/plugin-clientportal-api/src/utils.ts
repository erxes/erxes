import { debugError } from '@erxes/api-utils/src/debuggers';
import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: []
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const generateFields = async ({ subdomain }) => {
  console.log(
    ' ****************************** generateFields ******************************'
  );
  const models = await generateModels(subdomain);

  const { ClientPortalUsers } = models;

  const schema = ClientPortalUsers.schema as any;
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
    console.log('field: ', fields);
    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  return fields;
};

export const sendSms = async (
  subdomain: string,
  type: string,
  phoneNumber: string,
  content: string
) => {
  switch (type) {
    case 'messagePro':
      const MESSAGE_PRO_API_KEY = await getConfig(
        'MESSAGE_PRO_API_KEY',
        subdomain,
        ''
      );

      const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
        'MESSAGE_PRO_PHONE_NUMBER',
        subdomain,
        ''
      );

      if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
        throw new Error('messagin config not set properly');
      }

      try {
        await sendRequest({
          url: 'https://api.messagepro.mn/send',
          method: 'GET',
          params: {
            key: MESSAGE_PRO_API_KEY,
            from: MESSAGE_PRO_PHONE_NUMBER,
            to: phoneNumber,
            text: content
          }
        });

        return 'sent';
      } catch (e) {
        debugError(e.message);
        throw new Error(e.message);
      }

    default:
      break;
  }
};

export const generateRandomPassword = (len: number = 10) => {
  const specials = '!@#$%^&*()_+{}:"<>?|[];\',./`~';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const pick = (
    exclusions: string,
    string: string,
    min: number,
    max: number
  ) => {
    let n,
      chars = '';

    if (max === undefined) {
      n = min;
    } else {
      n = min + Math.floor(Math.random() * (max - min + 1));
    }

    let i = 0;
    while (i < n) {
      const character = string.charAt(
        Math.floor(Math.random() * string.length)
      );
      if (exclusions.indexOf(character) < 0 && chars.indexOf(character) < 0) {
        chars += character;
        i++;
      }
    }

    return chars;
  };

  const shuffle = (string: string) => {
    const array = string.split('');
    let tmp,
      current,
      top = array.length;

    if (top)
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }

    return array.join('');
  };

  let password = '';

  password += pick(password, specials, 1, 1);
  password += pick(password, lowercase, 2, 3);
  password += pick(password, uppercase, 2, 3);
  password += pick(password, numbers, 3, 3);

  return shuffle(password);
};
