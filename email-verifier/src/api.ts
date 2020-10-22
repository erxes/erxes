import * as EmailValidator from 'email-deep-validator';
import { EMAIL_VALIDATION_SOURCES, EMAIL_VALIDATION_STATUSES, Emails } from './models';
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

    if (typeof response === 'string') {
      return JSON.parse(response);
    }

    return response;
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
    debugBase(`This email is already verified`);

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: { email, status: emailOnDb.status },
        source: EMAIL_VALIDATION_SOURCES.ERXES,
      },
    });
  }

  const emailValidator = new EmailValidator();
  const { validDomain, validMailbox } = await emailValidator.verify(email);

  if (validDomain && validMailbox) {
    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: { email, status: EMAIL_VALIDATION_STATUSES.VALID },
        source: EMAIL_VALIDATION_SOURCES.ERXES,
      },
    });
  }

  let response: { status?: string; result?: string } = {};

  if (EMAIL_VERIFICATION_TYPE === 'truemail') {
    try {
      debugBase(`Email is not found on verifier DB. Sending request to truemail`);
      response = await singleTrueMail(email);

      debugBase(`Received single email validation status`);
    } catch (e) {
      // request may fail
      throw e;
    }
  }

  if (response.status === 'success') {
    const doc = { email, status: response.result };

    if (doc.status === EMAIL_VALIDATION_STATUSES.VALID || doc.status === EMAIL_VALIDATION_STATUSES.INVALID) {
      await Emails.createEmail(doc);
    }

    debugBase(`Sending single email validation status to erxes-api`);

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: doc,
        source: EMAIL_VALIDATION_SOURCES.TRUEMAIL,
      },
    });
  }

  // if status is not success
  return sendRequest({
    url: `${hostname}/verifier/webhook`,
    method: 'POST',
    body: {
      email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
      source: EMAIL_VALIDATION_SOURCES.TRUEMAIL,
    },
  });
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
      debugBase(`Sending already verified emails to erxes-api`);

      await sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          emails: verifiedEmails,
          source: EMAIL_VALIDATION_SOURCES.ERXES,
        },
      });
    } catch (e) {
      // request may fail
      throw e;
    }
  }

  if (unverifiedEmails.length > 0) {
    debugBase(`Sending  unverified email to truemail`);

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
  debugBase(`Downloading bulk email validation result`);

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

      if (status === EMAIL_VALIDATION_STATUSES.VALID || status === EMAIL_VALIDATION_STATUSES.INVALID) {
        const found = await Emails.findOne({ email });

        if (!found) {
          const doc = {
            email,
            status,
            created: new Date(),
          };

          await Emails.createEmail(doc);
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
      source: EMAIL_VALIDATION_SOURCES.TRUEMAIL,
    },
  });
};
