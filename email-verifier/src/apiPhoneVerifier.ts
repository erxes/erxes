import * as csv from 'csv-writer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as request from 'request-promise';
import { PHONE_VALIDATION_STATUSES, Phones } from './models';
import { getArray, setArray } from './redisClient';
import { debugBase, debugError, getEnv, sendRequest } from './utils';

dotenv.config();

const CLEAR_OUT_PHONE_API_KEY = getEnv({ name: 'CLEAR_OUT_PHONE_API_KEY' });

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
      url: 'https://api.clearoutphone.io/v1/phonenumber/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`
      },
      body: { number: phone }
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
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);

  const csvWriter = csv.createObjectCsvWriter({
    path: `./${fileName}.csv`,
    header: [{ id: 'number', title: 'Phone' }]
  });

  await csvWriter.writeRecords(
    unverifiedPhones.map(phone => ({ number: phone }))
  );

  try {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    await sendFile(fileName, hostname);
  } catch (e) {
    debugBase(`Error occured during bulk phone validation ${e.message}`);
    throw e;
  }
};

export const sendFile = async (fileName: string, hostname: string) => {
  try {
    const result = await request({
      method: 'POST',
      url: 'https://api.clearoutphone.io/v1/phonenumber/bulk',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`
      },
      formData: {
        file: fs.createReadStream(`./${fileName}.csv`)
      }
    });

    let data;
    let error;

    if (typeof result === 'string') {
      data = JSON.parse(result).data;
      error = JSON.parse(result).error;
    } else {
      data = result.data;
      error = result.error;
    }

    if (data) {
      const listIds = await getArray('erxes_phone_verifier_list_ids');

      listIds.push({ listId: data.list_id, hostname });

      setArray('erxes_phone_verifier_list_ids', listIds);

      await fs.unlinkSync(`./${fileName}.csv`);
    } else if (error) {
      throw new Error(error.message);
    }
  } catch (e) {
    // request may fail
    throw e;
  }
};

export const getStatus = async (listId: string) => {
  const url = `https://api.clearoutphone.io/v1/phonenumber/bulk/progress_status?list_id=${listId}`;
  try {
    const result = await request({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`
      }
    });

    if (typeof result === 'string') {
      return JSON.parse(result);
    }

    return result;
  } catch (e) {
    // request may fail
    throw e;
  }
};

export const validateSinglePhone = async (phone: string, hostname: string) => {
  const phoneOnDb = await Phones.findOne({ phone }).lean();

  if (phoneOnDb) {
    debugBase(`This phone number is already verified`);

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        phone: { phone, status: phoneOnDb.status }
      }
    });
  }

  if (!phone.includes('+')) {
    debugBase('Phone number must include country code for verification!');
    return { phone, status: PHONE_VALIDATION_STATUSES.UNKNOWN };
  }

  let response: { status?: string; data?: any } = {};

  try {
    debugBase(
      `Phone number is not found on verifier DB. Sending request to clearoutphone`
    );
    response = await singleClearOut(phone);
    debugBase(`Received single phone validation status`);
  } catch (e) {
    return { phone, status: PHONE_VALIDATION_STATUSES.UNKNOWN };
  }

  if (response.status === 'success') {
    const data = response.data;
    await savePhone({
      phone,
      status: data.status,
      lineType: data.lineType,
      carrier: data.carrier,
      internationalFormat: data.internationalFormat,
      localFormat: data.localFormat
    });

    debugBase(`Sending single phone validation status to erxes-api`);

    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        phone: { phone, status: data.status }
      }
    });
  } else {
    // if status is not success
    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        phone: { phone, status: PHONE_VALIDATION_STATUSES.UNKNOWN }
      }
    });
  }
};

export const validateBulkPhones = async (
  phones: string[],
  hostname: string
) => {
  const phonesOnDb = await Phones.find({ phone: { $in: phones } });

  const phonesMap: Array<{ phone: string; status: string }> = phonesOnDb.map(
    ({ phone, status }) => ({
      phone,
      status
    })
  );

  const verifiedPhones = phonesMap.map(verified => ({
    phone: verified.phone,
    status: verified.status
  }));

  const unverifiedPhones: string[] = phones.filter(
    phone => !verifiedPhones.some(p => p.phone === phone)
  );

  if (verifiedPhones.length > 0) {
    try {
      debugBase(`Sending already verified phones to erxes-api`);

      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phones: verifiedPhones
        }
      });
    } catch (e) {
      // request may fail
      throw e;
    }
  }

  if (unverifiedPhones.length > 0) {
    try {
      debugBase(`Sending  unverified phones to clearoutphone`);
      await bulkClearOut(unverifiedPhones, hostname);
    } catch (e) {
      // request may fail
      throw e;
    }
  }
};

export const getBulkResult = async (listId: string, hostname: string) => {
  const url = 'https://api.clearoutphone.io/v1/download/result';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer:${CLEAR_OUT_PHONE_API_KEY}`
  };

  try {
    debugBase(`Downloading bulk phone validation result`);
    const response = await sendRequest({
      url,
      method: 'POST',
      headers,
      body: { list_id: listId }
    });

    try {
      const resp = await sendRequest({
        url: response.data.url,
        method: 'GET'
      });

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
              status
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
                localFormat
              };

              await savePhone(doc);
            }
          }
        }
      }

      debugBase(`Sending bulk phone validation result to erxes-api`);

      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          phones
        }
      });
    } catch (e) {
      // request may fail
      throw e;
    }
  } catch (e) {
    // request may fail
    throw e;
  }
};
