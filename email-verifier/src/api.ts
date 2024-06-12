import * as tmp from 'tmp';
import * as csv from 'csv-writer';
import * as dotenv from 'dotenv';

import {
  EMAIL_VALIDATION_SOURCES,
  EMAIL_VALIDATION_STATUSES,
  Emails,
} from './models';
import {
  debugBase,
  debugError,
  getEnv,
  isValidDomain,
  isValidEmail,
  sendFile,
  sendRequest,
} from './utils';
import fetch from 'node-fetch';

dotenv.config();

const CLEAR_OUT_API_KEY = getEnv({ name: 'CLEAR_OUT_API_KEY' });
const CLEAR_OUT_API_URL = 'https://api.clearout.io/v2';

export const single = async (email: string, hostname: string) => {
  email = email.toString();

  if (!isValidEmail(email)) {
    debugBase(`This email is not valid`, email);
    return { email, status: EMAIL_VALIDATION_STATUSES.INVALID };
  }

  if (!isValidDomain(email)) {
    debugBase(`This domain is not valid`, email);
    return { email, status: EMAIL_VALIDATION_STATUSES.INVALID };
  }

  const emailOnDb = await Emails.findOne({ email });

  if (emailOnDb) {
    debugBase(`This email is already verified`, email);

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: { email, status: emailOnDb.status },
        source: EMAIL_VALIDATION_SOURCES.ERXES,
      },
    });
  }

  try {
    const response: any = await fetch(
      `${CLEAR_OUT_API_URL}/email_verify/instant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer:${CLEAR_OUT_API_KEY}`,
        },
        body: JSON.stringify({ email }),
      },
    ).then((r) => r.json());

    if (response.status !== 'success') {
      debugBase(`Error occured during single clearout validation`, email);
      return sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
          source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
        },
      });
    }

    const { data } = response;

    if (data.status === 'valid') {
      debugBase(`successfully clearout:`, email, ' status: ', data.status);
      return sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          email: { email, status: EMAIL_VALIDATION_STATUSES.VALID },
          source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
        },
      });
    }

    if (['unknown', 'invalid'].includes(data.status)) {
      debugBase(`successfully clearout:`, email, ' status: ', data.status);
      return sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          email: { email, status: data.status },
          source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
        },
      });
    }

    return response;
  } catch (e) {
    debugError(`Error occured during single clearout validation ${e.message}`);
    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
        source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
      },
    });
  }
};

export const bulk = async (emails: string[], hostname: string) => {
  const emailsOnDb = await Emails.find({ email: { $in: emails } });

  const emailsMap: Array<{ email: string; status: string }> = emailsOnDb.map(
    ({ email, status }) => ({
      email,
      status,
    }),
  );

  const verifiedEmails = emailsMap.map((verified) => ({
    email: verified.email,
    status: verified.status,
  }));

  const unverifiedEmails: string[] = emails.filter(
    (email) => !verifiedEmails.some((e) => e.email === email),
  );

  if (verifiedEmails.length > 0) {
    try {
      debugBase(`Sending already verified emails to erxes-api`);

      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          emails: verifiedEmails,
        },
      });
    } catch (e) {
      throw e;
    }
  }

  if (unverifiedEmails.length > 0) {
    try {
      debugBase(`Sending  unverified email to clearout`);
      await bulkClearOut(unverifiedEmails, hostname);
    } catch (e) {
      throw e;
    }
  }
};

export const bulkClearOut = async (emails: string[], hostname: string) => {
  const fileName =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const tmpFile = tmp.fileSync({
    postfix: '.csv',
    name: `${fileName}.csv`,
  });

  const csvWriter = csv.createObjectCsvWriter({
    path: tmpFile.name,
    header: [{ id: 'email', title: 'Email' }],
  });

  const emailsMapped = [];

  for (const email of emails) {
    if (!isValidEmail(email)) {
      continue;
    }

    if (!isValidDomain(email)) {
      continue;
    }

    emailsMapped.push({ email });
  }

  await csvWriter.writeRecords(emailsMapped);

  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const url = `${CLEAR_OUT_API_URL}/email_verify/bulk`;
    const redisKey = 'erxes_email_verifier_list_ids';

    await sendFile(url, CLEAR_OUT_API_KEY, tmpFile.name, hostname, redisKey);
  } catch (e) {
    debugBase(`Error occured during bulk email validation ${e.message}`);
    throw e;
  }
};

export const getProgressStatus = async (listId: string) => {
  const url = `${CLEAR_OUT_API_URL}/email_verify/bulk/progress_status?list_id=${listId}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer:${CLEAR_OUT_API_KEY}`,
      },
    }).then((r) => r.json());

    return res;
  } catch (e) {
    throw e;
  }
};

export const getResult = async (listId: string, hostname: string) => {
  const url = `${CLEAR_OUT_API_URL}/download/result`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer:${CLEAR_OUT_API_KEY}`,
  };
  try {
    const response: any = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ list_id: listId }),
    }).then((r) => r.json());

    const resp = await fetch(response.data.url, {
      method: 'GET',
    }).then((r) => r.text());

    const rows = resp.split('\n');
    const emails: Array<{ email: string; status: string }> = [];

    for (const [index, row] of rows.entries()) {
      if (index !== 0) {
        const rowArray = row.split(',');

        if (rowArray.length > 12) {
          const email = rowArray[0];
          let status = rowArray[2].toLowerCase();

          emails.push({
            email,
            status,
          });

          const found = await Emails.findOne({ email });

          if (!found) {
            Emails.createEmail({ email, status });
          }
        }
      }
    }

    debugBase(`Sending bulk email validation result to erxes-api`);

    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        emails,
      },
    });
  } catch (e) {
    throw e;
  }
};

// create bulk validation queue because of sendgrid does not support bulk validation
// const REDIS_QUEUE_KEY = 'erxes_email_verifier_queue';
// const enqueueEmail = async (email: string, hostname: string) => {
//   const doc = { email, hostname };
//   // redis.rpush(REDIS_QUEUE_KEY, JSON.stringify(doc));
//   pushToQueue(REDIS_QUEUE_KEY, JSON.stringify(doc));
// };

// const dequeueEmail = async () => {
//   // return redis.lpop(REDIS_QUEUE_KEY);
//   return popFromQueue(REDIS_QUEUE_KEY);
// };

// const sleep = (ms: number) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// };

// const processQueue = async (hostname: string) => {
//   const inverval = 1000;

//   while (true) {
//     const result: any = await dequeueEmail();

//     if (!result) {
//       break;
//     }

//     const obj = JSON.parse(result);

//     if (obj.hostname !== hostname) {
//       continue;
//     }

//     const { email } = obj;

//     try {
//       await single(email, hostname);
//     } catch (e) {
//       debugError(
//         `Error occured during single email validation ${e.message}, email: ${email}`
//       );
//     }

//     await sleep(inverval);
//   }
// };
