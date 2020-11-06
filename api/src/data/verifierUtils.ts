import { Transform } from 'stream';
import { Customers } from '../db/models';
import {
  IValidationResponse,
  IVisitorContact
} from '../db/models/definitions/customers';
import { debugBase, debugExternalApi } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { getEnv, sendRequest } from './utils';

export const validateSingle = async (contact: IVisitorContact) => {
  const EMAIL_VERIFIER_ENDPOINT = getEnv({
    name: 'EMAIL_VERIFIER_ENDPOINT',
    defaultValue: ''
  });

  const hostname = memoryStorage().get('hostname');

  const { email, phone } = contact;

  let body = {};

  phone ? (body = { phone, hostname }) : (body = { email, hostname });

  const requestOptions = {
    url: `${EMAIL_VERIFIER_ENDPOINT}/verify-single`,
    method: 'POST',
    body
  };

  try {
    await sendRequest(requestOptions);
  } catch (e) {
    debugExternalApi(
      `An error occurred while sending request to the email verifier. Error: ${e.message}`
    );
    throw e;
  }
};

export const updateContactValidationStatus = async (
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

export const validateBulk = async (verificationType: string) => {
  const EMAIL_VERIFIER_ENDPOINT = getEnv({
    name: 'EMAIL_VERIFIER_ENDPOINT',
    defaultValue: ''
  });

  const hostname = memoryStorage().get('hostname');

  if (verificationType === 'email') {
    const emails: Array<{}> = [];

    const customerTransformerToEmailStream = new Transform({
      objectMode: true,

      transform(customer, _encoding, callback) {
        emails.push(customer.primaryEmail);

        callback();
      }
    });

    const customersEmailStream = (Customers.find(
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
            body: { emails, hostname }
          };

          sendRequest(requestOptions)
            .then(res => {
              debugBase(`Response: ${res}`);
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

  const customersStream = (Customers.find(
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
          body: { phones, hostname }
        };

        sendRequest(requestOptions)
          .then(res => {
            debugBase(`Response: ${res}`);
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
    await Customers.bulkWrite(bulkOps);
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
  await Customers.bulkWrite(phoneBulkOps);
};
