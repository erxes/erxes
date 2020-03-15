import * as EmailValidator from 'email-deep-validator';
import { sendMessage } from './messageBroker';
import { EMAIL_VALIDATION_STATUSES, Emails } from './models';
import { debugBase, sendRequest } from './utils';

const { TRUE_MAIL_API_KEY, EMAIL_VERIFICATION_TYPE = 'truemail' } = process.env;

const sendSingleMessage = async (doc: { email: string; status: string }, create?: boolean) => {
  if (create) {
    await Emails.createEmail(doc);
  }

  return sendMessage('emailVerifierNotification', { action: 'emailVerify', data: [doc] });
};

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

const bulkTrueMail = async (unverifiedEmails: string[]) => {
  const url = `https://truemail.io/api/v1/tasks/bulk?access_token=${TRUE_MAIL_API_KEY}`;

  try {
    const result = await sendRequest({
      url,
      method: 'POST',
      body: {
        file: unverifiedEmails,
      },
    });

    sendMessage('emailVerifierBulkEmailNotification', { action: 'bulk', data: result });
  } catch (e) {
    sendMessage('emailVerifierBulkEmailNotification', { action: 'bulk', data: e.message });
  }
};

export const single = async (email: string) => {
  const emailOnDb = await Emails.findOne({ email });

  if (emailOnDb) {
    return sendSingleMessage({ email, status: emailOnDb.status });
  }

  const emailValidator = new EmailValidator();
  const { validDomain, validMailbox } = await emailValidator.verify(email);

  if (validDomain && validMailbox) {
    return sendSingleMessage({ email, status: EMAIL_VALIDATION_STATUSES.VALID }, true);
  }

  let response: { status?: string; result?: string } = {};

  if (EMAIL_VERIFICATION_TYPE === 'truemail') {
    try {
      response = await singleTrueMail(email);
    } catch (_e) {
      return sendSingleMessage({ email, status: EMAIL_VALIDATION_STATUSES.UNKNOWN });
    }
  }

  if (response.status === 'success') {
    return sendSingleMessage({ email, status: response.result }, true);
  }

  // if status is not success
  return sendSingleMessage({ email, status: EMAIL_VALIDATION_STATUSES.INVALID });
};

export const bulk = async (emails: string[]) => {
  const unverifiedEmails: any[] = [];
  const verifiedEmails: any[] = [];

  for (const email of emails) {
    const found = await Emails.findOne({ email });

    if (found) {
      verifiedEmails.push({ email: found.email, status: found.status });
    } else {
      unverifiedEmails.push({ email });
    }
  }

  if (verifiedEmails.length > 0) {
    sendMessage('emailVerifierNotification', { action: 'emailVerify', data: verifiedEmails });
  }

  if (unverifiedEmails.length > 0) {
    switch (EMAIL_VERIFICATION_TYPE) {
      case 'truemail': {
        await bulkTrueMail(unverifiedEmails);

        break;
      }
    }
  } else {
    sendMessage('emailVerifierBulkNotification', {
      action: 'bulk',
      data: 'There are no emails to verify on the email verification system',
    });
  }
};
