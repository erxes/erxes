import * as dotenv from 'dotenv';
import {
  EMAIL_VALIDATION_SOURCES,
  EMAIL_VALIDATION_STATUSES,
  Emails,
} from './models';
import { popFromQueue, pushToQueue } from './redisClient';
import { debugBase, debugError, isEmailValid, sendRequest } from './utils';
import fetch from 'node-fetch';

dotenv.config();

const { REACHER_HOST, REACHER_PORT } = process.env;

const REDIS_QUEUE_KEY = 'emailVerificationQueue';

export const single = async (email: string, hostname: string) => {
  email = email.toString();
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

  let response: { status?: string; verdict?: string } = {};

  const url = `${REACHER_HOST}:${REACHER_PORT}/v0/check_email`;
  const data = {
    to_email: email,
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  console.log(options);

  try {
    const result = await fetch(url, options).then((r) => r.json());

    console.log(result);
    const doc = {
      status: 'unknown',
      email,
    };

    switch (result.is_reachable.toLowerCase()) {
      case 'safe':
        doc.status = EMAIL_VALIDATION_STATUSES.VALID;
        break;
      case 'invalid':
        doc.status = EMAIL_VALIDATION_STATUSES.INVALID;
        break;
      case 'unknown':
        doc.status = EMAIL_VALIDATION_STATUSES.UNKNOWN;
        break;
      case 'risky':
        doc.status = EMAIL_VALIDATION_STATUSES.RISKY;
        break;
      default:
        doc.status = EMAIL_VALIDATION_STATUSES.UNKNOWN;
        break;
    }

    await Emails.createEmail(doc);

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: doc,
        source: EMAIL_VALIDATION_SOURCES.REACHER,
      },
    });
  } catch (e) {
    response.status = 'failed';
  }

  console.log('email has been verified on sendgrid', email, response);

  // if status is not success
  return sendRequest({
    url: `${hostname}/verifier/webhook`,
    method: 'POST',
    body: {
      email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
      source: EMAIL_VALIDATION_SOURCES.REACHER,
    },
  });
};

export const bulk = async (emails: string[], hostname: string) => {
  emails = emails.map((email) => email.toString());

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

  const unverifiedEmails = emails.filter(
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

    // return bulkTrueMail(unverifiedEmails, hostname);

    unverifiedEmails.forEach((email) => {
      if (!isEmailValid(email)) {
        return;
      }

      enqueueEmail(email, hostname);
    });

    await processQueue(hostname);
  }
};

const enqueueEmail = async (email: string, hostname: string) => {
  const doc = { email, hostname };
  // redis.rpush(REDIS_QUEUE_KEY, JSON.stringify(doc));
  pushToQueue(REDIS_QUEUE_KEY, JSON.stringify(doc));
};

const dequeueEmail = async () => {
  // return redis.lpop(REDIS_QUEUE_KEY);
  return popFromQueue(REDIS_QUEUE_KEY);
};

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const processQueue = async (hostname: string) => {
  const inverval = 1000;

  while (true) {
    const result: any = await dequeueEmail();

    if (!result) {
      break;
    }

    const obj = JSON.parse(result);

    if (obj.hostname !== hostname) {
      continue;
    }

    const { email } = obj;

    try {
      await single(email, hostname);
    } catch (e) {
      debugError(
        `Error occured during single email validation ${e.message}, email: ${email}`,
      );
    }

    await sleep(inverval);
  }
};
