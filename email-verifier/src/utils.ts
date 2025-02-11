import * as debug from 'debug';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as dns from 'dns';
import redis from './redis';
import * as tmp from 'tmp';
import * as csv from 'csv-writer';
import {
  EMAIL_VALIDATION_SOURCES,
  EMAIL_VALIDATION_STATUSES,
  Emails,
} from './models';

export const debugBase = debug('erxes-email-verifier:base');
export const debugCrons = debug('erxes-email-verifier:crons');
export const debugError = debug('erxes-email-verifier:error');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

interface IRequestParams {
  url?: string;
  path?: string;
  method?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  body?: { [key: string]: any };
  form?: { [key: string]: any };
}

/**
 * Sends post request to specific url
 */
export const sendRequest = async (
  { url, method, headers, body }: IRequestParams,
  errorMessage?: string,
  retries: number = 3 // Retry mechanism
) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    } as any;

    if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Request failed with status ${response.status}. Response body: ${errorBody}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else if (contentType && contentType.includes('text/html')) {
      return response.text();
    } else {
      return response.text();
    }
  } catch (e) {
    if ((e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') && retries > 0) {
      console.debug('Retrying request...');
      return sendRequest(
        { url, method, headers, body },
        errorMessage,
        retries - 1
      );
    } else if (e.message.includes('524')) {
      throw new Error('The request timed out. Please try again later.');
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

export const getEnv = ({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return value || '';
};

export const isValidDomain = async (email) => {
  const domain = email.split('@')[1];

  const cachedDomainResponse = await redis.get(`verifier:${domain}`);

  if (!cachedDomainResponse) {
    return new Promise((resolve) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err) {
          resolve(false);
        } else {
          if (addresses.length > 0) {
            redis.set(`verifier:${domain}`, 'valid', 'EX', 24 * 60 * 60);
          }

          resolve(true);
        }
      });
    });
  }

  return cachedDomainResponse === 'valid' ? true : false;
};

export const isValidEmail = (email) => {
  const complexEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  return complexEmailRegex.test(email);
};

export const sendFile = async (
  url: string,
  token: string,
  fileName: string,
  hostname: string,
  key: string
) => {
  const form = new FormData();

  const fileStream = fs.createReadStream(fileName);

  form.append('file', fileStream);

  try {
    const result: any = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer:${token}`,
      },
      body: form,
    }).then((r) => r.json());

    const { data, error } = result;

    if (data) {
      const listIds = await getArray(key);

      listIds.push({ listId: data.list_id, hostname });

      setArray(key, listIds);

      tmp.setGracefulCleanup();
      await fs.unlinkSync(fileName);
    } else if (error) {
      throw new Error(error.message);
    }
  } catch (e) {
    throw e;
  }
};

export const setArray = async (key, array) => {
  const jsonArray = JSON.stringify(array);
  await redis.set(key, jsonArray);
};

export const getArray = async (key) => {
  const jsonArray = await redis.get(key);

  if (!jsonArray) {
    return [];
  }

  return JSON.parse(jsonArray);
};

export const verifyOnClearout = async (email: string, hostname: string) => {
  const CLEAR_OUT_API_KEY = getEnv({ name: 'CLEAR_OUT_API_KEY' });
  const CLEAR_OUT_API_URL = 'https://api.clearout.io/v2';
  let body: any = {};

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
      }
    ).then((r) => r.json());

    if (response.status !== 'success') {
      
      body = {
        email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
        source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
      };
    }

    const { data } = response;

    if (data.status === 'valid') {
      
      body = {
        email: { email, status: EMAIL_VALIDATION_STATUSES.VALID },
        source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
      };
    }

    if (['unknown', 'invalid'].includes(data.status)) {
      
      body = {
        email: { email, status: data.status },
        source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
      };
    }

    return response;
  } catch (e) {
    debugError(`Error occured during single clearout validation ${e.message}`);

    body = {
      email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
      source: EMAIL_VALIDATION_SOURCES.CLEAROUT,
    };
  }
  try {
    Emails.createEmail(body.email);

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body,
    });
  } catch (e) {
    debugError(`Error occurred during request sending: ${e.message}`);
    
  }
};

export const verifyOnMailsso = async (email: string, hostname: string) => {
  const MAILS_SO_KEY = getEnv({ name: 'MAILS_SO_KEY' });
  let body: any = {};
  let status = EMAIL_VALIDATION_STATUSES.UNKNOWN;

  try {
    const response = await fetch(
      `https://api.mails.so/v1/validate?email=${email}`,
      {
        method: 'GET',
        headers: {
          'x-mails-api-key': MAILS_SO_KEY,
        },
      }
    );

    const data = await response.json();
    console.log("*********** ",data)
    const res = data.data;
    console.log("Ressss ",res)

    if (res.result !== 'deliverable') {
      
      body = {
        email: { email, status: EMAIL_VALIDATION_STATUSES.INVALID },
        source: EMAIL_VALIDATION_SOURCES.MAILSSO,
      };

      status = EMAIL_VALIDATION_STATUSES.INVALID;
    } else {
      
      body = {
        email: { email, status: EMAIL_VALIDATION_STATUSES.VALID },
        source: EMAIL_VALIDATION_SOURCES.MAILSSO,
      };

      status = EMAIL_VALIDATION_STATUSES.VALID;
    }
  } catch (error) {
    debugBase(
      `Error occurred during single mail validation`,
      email,
      ' error:',
      error
    );

    body = {
      email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
      source: EMAIL_VALIDATION_SOURCES.MAILSSO,
    };
  }

  try {
    await Emails.createEmail({ email, status });
    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body,
    });
  } catch (e) {
    debugError(`Error occurred during request sending: ${e.message}`);
  }

  return body;
};

export const bulkMailsso = async (emails: string[], hostname?: string) => {
  const MAILS_SO_KEY = getEnv({ name: 'MAILS_SO_KEY' });
  const body = { emails };
  const redisKey = 'erxes_email_verifier_list_ids';

  fetch('https://api.mails.so/v1/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mails-api-key': MAILS_SO_KEY,
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(async (result) => {
      const listIds = await getArray(redisKey);

      listIds.push({ listId: result.id, hostname });

      setArray(redisKey, listIds);
    })
    .catch((error) => console.error('Error:', error));
};

export const bulkClearOut = async (emails: string[], hostname: string) => {
  const CLEAR_OUT_API_KEY = getEnv({ name: 'CLEAR_OUT_API_KEY' });
  const CLEAR_OUT_API_URL = 'https://api.clearout.io/v2';
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
        throw e;
  }
};

export const getProgressStatus = async (listId: string) => {
  const CLEAR_OUT_API_KEY = getEnv({ name: 'CLEAR_OUT_API_KEY' });
  const CLEAR_OUT_API_URL = 'https://api.clearout.io/v2';

  const url = `${CLEAR_OUT_API_URL}/email_verify/bulk/progress_status?list_id=${listId}`;
  try {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer:${CLEAR_OUT_API_KEY}`,
      },
    }).then((r) => r.json());
  } catch (e) {
    throw e;
  }
};

export const getResult = async (listId: string, hostname: string) => {
  const CLEAR_OUT_API_KEY = getEnv({ name: 'CLEAR_OUT_API_KEY' });
  const CLEAR_OUT_API_URL = 'https://api.clearout.io/v2';

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
