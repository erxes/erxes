import * as EmailValidator from 'email-deep-validator';
import { EMAIL_VALIDATION_STATUSES, Emails } from './models';
import { getArray, setArray } from './redisClient';
import { debugBase, sendRequest } from './utils';

const { TRUE_MAIL_API_KEY, EMAIL_VERIFICATION_TYPE = 'truemail' } = process.env;

const singleTrueMail = async (email: string) => {
  try {
    const url = `https://truemail.io/api/v1/verify/single?access_token=${TRUE_MAIL_API_KEY}&email=${email}`;

    const response = await sendRequest({
      url,
      method: 'GET',
    });

    return JSON.parse(response);
  } catch (e) {
    debugBase(`Error occured during single true mail validation ${e.message}`);
    throw e;
  }
};

const bulkTrueMail = async (unverifiedEmails: string[], hostname: string) => {
  const url = `https://truemail.io/api/v1/tasks/bulk?access_token=${TRUE_MAIL_API_KEY}`;

  try {
    const result = await sendRequest({
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: {
        file: unverifiedEmails.map(e => ({ email: e })),
      },
    });

    const { data, error } = JSON.parse(result);

    if (data) {
      const taskIds = await getArray('erxes_email_verifier_task_ids');

      taskIds.push({ taskId: data.task_id, hostname });

      setArray('erxes_email_verifier_task_ids', taskIds);
    } else if (error) {
      throw new Error(error.message);
    }
  } catch (e) {
    // request may fail
    throw e;
  }
};

export const single = async (email: string, hostname: string) => {
  const emailOnDb = await Emails.findOne({ email });

  if (emailOnDb) {
    return { email, status: emailOnDb.status };
  }

  const emailValidator = new EmailValidator();
  const { validDomain, validMailbox } = await emailValidator.verify(email);

  if (validDomain && validMailbox) {
    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: { email, status: EMAIL_VALIDATION_STATUSES.VALID },
      },
    });
  }

  let response: { status?: string; result?: string } = {};

  if (EMAIL_VERIFICATION_TYPE === 'truemail') {
    try {
      response = await singleTrueMail(email);
    } catch (e) {
      // request may fail
      throw e;
    }
  }

  if (response.status === 'success') {
    const doc = { email, status: response.result };

    await Emails.createEmail(doc);

    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: doc,
      },
    });
  } else {
    // if status is not success
    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
      },
    });
  }
};

export const bulk = async (emails: string[], hostname: string) => {
  const emailsOnDb = await Emails.find({ email: { $in: emails } });

  const emailsMap: Array<{ email: string; status: string }> = emailsOnDb.map(({ email, status }) => ({
    email,
    status,
  }));

  const verifiedEmails = emailsMap.map(verified => ({ email: verified.email, status: verified.status }));

  const unverifiedEmails = emails.filter(email => !verifiedEmails.some(e => e.email === email));

  if (verifiedEmails.length > 0) {
    try {
      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          emails: verifiedEmails,
        },
      });
    } catch (e) {
      // request may fail
      throw e;
    }
  }

  if (unverifiedEmails.length > 0) {
    return bulkTrueMail(unverifiedEmails, hostname);
  }
};

export const checkTask = async (taskId: string) => {
  const url = `https://truemail.io/api/v1/tasks/${taskId}/status?access_token=${TRUE_MAIL_API_KEY}`;

  const response = await sendRequest({
    url,
    method: 'GET',
  });

  return JSON.parse(response).data;
};

export const getTrueMailBulk = async (taskId: string, hostname: string) => {
  const url = `https://truemail.io/api/v1/tasks/${taskId}/download?access_token=${TRUE_MAIL_API_KEY}&timeout=30000`;

  const response = await sendRequest({
    url,
    method: 'GET',
  });

  const rows = response.split('\n');
  const emails: Array<{ email: string; status: string }> = [];

  for (const row of rows) {
    const rowArray = row.split(',');

    if (rowArray.length > 2) {
      const email = rowArray[0];
      const status = rowArray[2];

      emails.push({
        email,
        status,
      });

      const found = await Emails.findOne({ email });

      if (!found) {
        const doc = {
          email,
          status,
          created: new Date(),
        };

        await Emails.create(doc);
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
};
