import * as EmailValidator from 'email-deep-validator';
import {
  EMAIL_VALIDATION_SOURCES,
  EMAIL_VALIDATION_STATUSES,
  Emails,
} from './models';
import { popFromQueue, pushToQueue } from './redisClient';
import { debugBase, debugError, isEmailValid, sendRequest } from './utils';
import * as dotenv from 'dotenv';

dotenv.config();

const { SENDGRID_API_KEY } = process.env;

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

  let response: { status?: string; verdict?: string } = {};

  const client = require('@sendgrid/client');

  client.setApiKey(SENDGRID_API_KEY);

  const request = {
    method: 'POST',
    url: '/v3/validations/email',
    body: { email },
  };

  console.log('verifying email on sendgrid', email);

  try {
    const [body] = await client.request(request);
    const { statusCode } = body;
    if (statusCode !== 200) {
      throw new Error(`Sendgrid returned status code ${statusCode}`);
    }

    response = body.body.result;
    response.status = 'success';
  } catch (e) {
    debugError(`Error occured during single sendgrid validation ${e.message}`);
    console.error('email', email);
    throw e;
  }

  console.log('email has been verified on sendgrid', email, response);

  if (response.status === 'success') {
    const doc = { email, status: response.verdict.toLowerCase() };

    if (
      doc.status === EMAIL_VALIDATION_STATUSES.VALID ||
      doc.status === EMAIL_VALIDATION_STATUSES.INVALID
    ) {
      await Emails.createEmail(doc);
    }

    debugBase(
      `Sending single email validation status to `,
      `${hostname}/verifier/webhook`,
    );

    return sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        email: doc,
        source: EMAIL_VALIDATION_SOURCES.SENDGRID,
      },
    });
  }

  // if status is not success
  return sendRequest({
    url: `${hostname}/verifier/webhook`,
    method: 'POST',
    body: {
      email: { email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN },
      source: EMAIL_VALIDATION_SOURCES.SENDGRID,
    },
  });
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
