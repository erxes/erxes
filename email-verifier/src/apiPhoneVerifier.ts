import * as csv from 'csv-writer';
import * as dotenv from 'dotenv';
import { PHONE_VALIDATION_STATUSES, Phones } from './models';
import { debugBase, debugError, getEnv, sendFile, sendRequest } from './utils';
import fetch from 'node-fetch';

dotenv.config();

const CLEAR_OUT_PHONE_API_KEY = getEnv({ name: 'CLEAR_OUT_PHONE_API_KEY' });
const CLEAR_OUT_PHONE_API_URL = 'https://api.clearoutphone.io/v1';

const savePhone = async (doc: {
  phone: string;
  status: string;
  lineType?: string;
  carrier?: string;
  internationalFormat?: string;
  localFormat?: string;
}) => {
  if (doc.lineType === 'mobile') {
    doc.status = PHONE_VALIDATION_STATUSES.RECEIVES_SMS;
  }
  await Phones.createPhone(doc);
};

const singleClearOut = async (phone: string): Promise<any> => {
  try {
    const response = await sendRequest({
      url: `${CLEAR_OUT_PHONE_API_URL}/phonenumber/validate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`,
      },
      body: { number: phone },
    });

    if (typeof response === 'string') {
      return JSON.parse(response);
    }

    return response;
  } catch (e) {
    debugError(`Error occured during single phone validation ${e.message}`);
    throw e;
  }
};

const bulkClearOut = async (unverifiedPhones: string[], hostname: string) => {
  const fileName =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const csvWriter = csv.createObjectCsvWriter({
    path: `./${fileName}.csv`,
    header: [{ id: 'number', title: 'Phone' }],
  });

  await csvWriter.writeRecords(
    unverifiedPhones.map((phone) => ({ number: phone }))
  );

  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const url = `${CLEAR_OUT_PHONE_API_URL}/phonenumber/bulk`;
    const redisKey = 'erxes_phone_verifier_list_ids';

    await sendFile(url, CLEAR_OUT_PHONE_API_KEY, fileName, hostname, redisKey);
  } catch (e) {
        throw e;
  }
};

export const getStatus = async (listId: string) => {
  const url = `${CLEAR_OUT_PHONE_API_URL}/phonenumber/bulk/progress_status?list_id=${listId}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`,
      },
    }).then((r) => r.json());

    return res;
  } catch (e) {
    throw e;
  }
};

export const validateSinglePhone = async (phone: string, hostname: string) => {
  phone = phone.toString();
  const phoneOnDb = await Phones.findOne({ phone }).lean();

  if (phoneOnDb) {
        try {
      return sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phone: { phone, status: phoneOnDb.status },
        },
      });
    } catch (e) {
      throw e;
    }
  }

  if (!phone.includes('+')) {
        return { phone, status: PHONE_VALIDATION_STATUSES.UNKNOWN };
  }

  let response: { status?: string; data?: any } = {};

  try {
    debugBase(
      `Phone number is not found on verifier DB. Sending request to clearoutphone`
    );
    response = await singleClearOut(phone);
      } catch (e) {
    return { phone, status: PHONE_VALIDATION_STATUSES.UNKNOWN };
  }
  try {
    if (response.status === 'success') {
      const data = response.data;
      await savePhone({
        phone,
        status: data.status,
        lineType: data.lineType,
        carrier: data.carrier,
        internationalFormat: data.internationalFormat,
        localFormat: data.localFormat,
      });

      
      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phone: { phone, status: data.status },
        },
      });
    } else {
      // if status is not success
      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phone: { phone, status: PHONE_VALIDATION_STATUSES.UNKNOWN },
        },
      });
    }
  } catch (e) {
    throw e;
  }
};

export const validateBulkPhones = async (
  phones: string[],
  hostname: string
) => {
  phones = phones.map((phone) => phone.toString());
  const phonesOnDb = await Phones.find({ phone: { $in: phones } });

  const phonesMap: Array<{ phone: string; status: string }> = phonesOnDb.map(
    ({ phone, status }) => ({
      phone,
      status,
    })
  );

  const verifiedPhones = phonesMap.map((verified) => ({
    phone: verified.phone,
    status: verified.status,
  }));

  const unverifiedPhones: string[] = phones.filter(
    (phone) => !verifiedPhones.some((p) => p.phone === phone)
  );

  if (verifiedPhones.length > 0) {
    try {
      
      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phones: verifiedPhones,
        },
      });
    } catch (e) {
      throw e;
    }
  }

  if (unverifiedPhones.length > 0) {
    try {
            await bulkClearOut(unverifiedPhones, hostname);
    } catch (e) {
      throw e;
    }
  }
};

export const getBulkResult = async (listId: string, hostname: string) => {
  const url = `${CLEAR_OUT_PHONE_API_URL}/download/result`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`,
  };

  try {
        const response: any = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ list_id: listId }),
    }).then((r) => r.json());

    try {
      const resp = await fetch(response.data.url, {
        method: 'GET',
      }).then((r) => r.text());

      const rows = resp.split('\n');
      const phones: Array<{ phone: string; status: string }> = [];

      for (const [index, row] of rows.entries()) {
        if (index !== 0) {
          const rowArray = row.split(',');

          if (rowArray.length > 12) {
            const phone = rowArray[0];
            let status = rowArray[1].toLowerCase();
            const lineType = rowArray[2];
            const carrier = rowArray[3];
            const internationalFormat = rowArray[8];
            const localFormat = rowArray[9];

            if (lineType === 'mobile') {
              status = PHONE_VALIDATION_STATUSES.RECEIVES_SMS;
            }

            phones.push({
              phone,
              status,
            });

            const found = await Phones.findOne({ phone });

            if (!found) {
              const doc = {
                phone,
                status,
                created: new Date(),
                lineType,
                carrier,
                internationalFormat,
                localFormat,
              };

              await savePhone(doc);
            }
          }
        }
      }

      
      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phones,
        },
      });
    } catch (e) {
      throw e;
    }
  } catch (e) {
    throw e;
  }
};
