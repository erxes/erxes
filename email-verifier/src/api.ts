import * as dotenv from 'dotenv';

import {
  EMAIL_VALIDATION_SOURCES,
  EMAIL_VALIDATION_STATUSES,
  Emails,
} from './models';
import {
  bulkClearOut,
  verifyOnClearout,
  debugBase,
  getEnv,
  isValidDomain,
  isValidEmail,
  sendRequest,
  verifyOnMailsso,
  bulkMailsso,
} from './utils';

dotenv.config();

export const single = async (email: string, hostname: string) => {
  const MAIL_VERIFIER_SERVICE = getEnv({
    name: 'MAIL_VERIFIER_SERVICE',
    defaultValue: 'mailsso',
  });

  email = email.toString();

  if (!isValidEmail(email)) {
    debugBase(`This email is not valid`, email);
    return { email, status: EMAIL_VALIDATION_STATUSES.INVALID };
  }

  if (!isValidDomain(email)) {
    debugBase(`This domain is not valid`, email);
    return { email, status: EMAIL_VALIDATION_STATUSES.INVALID };
  }

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const emailOnDb = await Emails.findOne({
    email,
    verifiedAt: { $gt: oneMonthAgo },
  });

  if (emailOnDb) {
    debugBase(`This email is already verified`, email);
    try {
      return sendRequest({
        url: `${hostname}/verifier/webhook`,
        method: 'POST',
        body: {
          email: { email, status: emailOnDb.status },
          source: EMAIL_VALIDATION_SOURCES.ERXES,
        },
      });
    } catch (e) {
      throw e;
    }
  }

  if (MAIL_VERIFIER_SERVICE === 'clearout') {
    return verifyOnClearout(email, hostname);
  }

  if (MAIL_VERIFIER_SERVICE === 'mailsso') {
    return verifyOnMailsso(email, hostname);
  }
};

export const bulk = async (emails: string[], hostname: string) => {
  const MAIL_VERIFIER_SERVICE = getEnv({
    name: 'MAIL_VERIFIER_SERVICE',
    defaultValue: 'mailsso',
  });

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const emailsOnDb = await Emails.find({
    email: { $in: emails },
    verifiedAt: { $gt: oneMonthAgo },
  });

  const emailsMap: Array<{ email: string; status: string }> = emailsOnDb.map(
    ({ email, status }) => ({
      email,
      status,
    })
  );


  const verifiedEmails = emailsMap.map((verified) => ({
    email: verified.email,
    status: verified.status,
  }));

  let unverifiedEmails: string[] = emails.filter(
    (email) => !verifiedEmails.some((e) => e.email === email)
  );
  const invalidEntries = unverifiedEmails.filter(
    (email) => !isValidEmail(email) || !isValidDomain(email)
  );

  unverifiedEmails = unverifiedEmails.filter(
    (email) => isValidEmail(email) && isValidDomain(email)
  );
  
  if (invalidEntries.length > 0) {
    debugBase(`Sending invalid emails to erxes-api`, invalidEntries);
    await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        emails: invalidEntries,
      },
    });
  }

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
    if (MAIL_VERIFIER_SERVICE === 'clearout') {
      try {
        debugBase(`Sending  unverified email to clearout`);
        await bulkClearOut(unverifiedEmails, hostname);
      } catch (e) {
        throw e;
      }
    }

    if (MAIL_VERIFIER_SERVICE === 'mailsso') {
      try {
        await bulkMailsso(unverifiedEmails, hostname);
      } catch (e) {
        throw e;
      }
    }
  }
};

