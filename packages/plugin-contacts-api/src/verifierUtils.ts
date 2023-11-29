import { Transform } from 'stream';
import {
  IValidationResponse,
  IVisitorContact
} from './models/definitions/customers';
import { debug, redis } from './configs';
import { getEnv, sendRequest } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';

export const validateSingle = async (
  subdomain: string,
  contact: IVisitorContact
) => {
  const EMAIL_VERIFIER_ENDPOINT = getEnv({
    name: 'EMAIL_VERIFIER_ENDPOINT',
    defaultValue: 'http://localhost:4100'
  });
  if (!EMAIL_VERIFIER_ENDPOINT) {
    return;
  }
  const { email, phone } = contact;

  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);

  const callback_url = `${domain}/pl:contacts`;

  let body = {};

  phone
    ? (body = { phone, hostname: callback_url })
    : (body = { email, hostname: callback_url });

  const requestOptions = {
    url: `${EMAIL_VERIFIER_ENDPOINT}/verify-single`,
    method: 'POST',
    body
  };

  try {
    await sendRequest(requestOptions);
  } catch (e) {
    debug.error(
      `An error occurred while sending request to the email verifier. Error: ${e.message}`
    );
  }
};

export const updateContactValidationStatus = async (
  { Customers }: IModels,
  data: IValidationResponse
) => {
  const { email, phone, status } = data;

  if (email) {
    await Customers.updateMany(
      { primaryEmail: email },
      { $set: { emailValidationStatus: status } }
    );
  }

  if (phone) {
    await Customers.updateMany(
      { primaryPhone: phone },
      { $set: { phoneValidationStatus: status } }
    );
  }
};

export const validateBulk = async (
  models: IModels,
  subdomain: string,
  verificationType: string
) => {
  const EMAIL_VERIFIER_ENDPOINT = getEnv({
    name: 'EMAIL_VERIFIER_ENDPOINT',
    defaultValue: ''
  });

  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';
  const domain = DOMAIN.replace('<subdomain>', subdomain);

  const callback_url = `${domain}/pl:contacts`;

  if (verificationType === 'email') {
    const emails: Array<{}> = [];

    const customerTransformerToEmailStream = new Transform({
      objectMode: true,

      transform(customer, _encoding, callback) {
        emails.push(customer.primaryEmail);

        callback();
      }
    });

    const customersEmailStream = (models.Customers.find(
      {
        primaryEmail: { $exists: true, $ne: null },
        $or: [
          { emailValidationStatus: 'unknown' },
          { emailValidationStatus: { $exists: false } }
        ]
      },
      { primaryEmail: 1, _id: 0 }
    ).limit(1000) as any).stream();

    return new Promise((resolve, reject) => {
      const pipe = customersEmailStream.pipe(customerTransformerToEmailStream);

      pipe.on('finish', async () => {
        try {
          const requestOptions = {
            url: `${EMAIL_VERIFIER_ENDPOINT}/verify-bulk`,
            method: 'POST',
            body: { emails, hostname: callback_url }
          };

          sendRequest(requestOptions)
            .then(res => {
              debug.info(`Response: ${res}`);
            })
            .catch(error => {
              throw error;
            });
        } catch (e) {
          return reject(e);
        }

        resolve('done');
      });
    });
  }

  const phones: Array<{}> = [];

  const customerTransformerStream = new Transform({
    objectMode: true,

    transform(customer, _encoding, callback) {
      phones.push(customer.primaryPhone);

      callback();
    }
  });

  const customersStream = (models.Customers.find(
    {
      primaryPhone: { $exists: true, $ne: null },
      $or: [
        { phoneValidationStatus: 'unknown' },
        { phoneValidationStatus: { $exists: false } }
      ]
    },
    { primaryPhone: 1, _id: 0 }
  ).limit(1000) as any).stream();

  return new Promise((resolve, reject) => {
    const pipe = customersStream.pipe(customerTransformerStream);

    pipe.on('finish', async () => {
      try {
        const requestOptions = {
          url: `${EMAIL_VERIFIER_ENDPOINT}/verify-bulk`,
          method: 'POST',
          body: { phones, hostname: callback_url }
        };
        sendRequest(requestOptions)
          .then(res => {
            debug.info(`Response: ${res}`);
          })
          .catch(error => {
            throw error;
          });
      } catch (e) {
        return reject(e);
      }
      resolve('done');
    });
  });
};

export const updateContactsValidationStatus = async (
  models: IModels,
  type: string,
  data: []
) => {
  if (type === 'email') {
    const bulkOps: Array<{
      updateMany: {
        filter: { primaryEmail: string };
        update: { emailValidationStatus: string };
      };
    }> = [];

    for (const { email, status } of data) {
      bulkOps.push({
        updateMany: {
          filter: { primaryEmail: email },
          update: { emailValidationStatus: status }
        }
      });
    }
    await models.Customers.bulkWrite(bulkOps);
  }

  const phoneBulkOps: Array<{
    updateMany: {
      filter: { primaryPhone: string };
      update: { phoneValidationStatus: string };
    };
  }> = [];

  for (const { phone, status } of data) {
    phoneBulkOps.push({
      updateMany: {
        filter: { primaryPhone: phone },
        update: { phoneValidationStatus: status }
      }
    });
  }
  await models.Customers.bulkWrite(phoneBulkOps);
};
