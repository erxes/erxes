import * as dotenv from 'dotenv';

import {
  EMAIL_VALIDATION_SOURCES,
  EMAIL_VALIDATION_STATUSES,
  Emails,
} from './models';
import {
  bulkClearOut,
  bulkMailsso,
  getEnv,
  isFormatValid,
  isValidDomain,
  sendRequest,
  verifyOnClearout,
  verifyOnMailsso
} from './utils';

dotenv.config();

export const single = async (email: string, hostname: string) => {
  const MAIL_VERIFIER_SERVICE = getEnv({
    name: 'MAIL_VERIFIER_SERVICE',
    defaultValue: 'mailsso',
  });

  email = email.toString();

  if (!isFormatValid(email)) {
        return { email, status: EMAIL_VALIDATION_STATUSES.INVALID };
  }

  if (!isValidDomain(email)) {
        return { email, status: EMAIL_VALIDATION_STATUSES.INVALID };
  }

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const emailOnDb = await Emails.findOne({
    email,
    verifiedAt: { $gt: oneMonthAgo },
  });

  if (emailOnDb) {
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
  console.debug('Bulk email verification started, total emails:', emails.length);
  const MAIL_VERIFIER_SERVICE = getEnv({
    name: 'MAIL_VERIFIER_SERVICE',
    defaultValue: 'mailsso',
  });

  
  const emailsOnDb = await Emails.find({
    email: { $in: emails, status: {$ne: EMAIL_VALIDATION_STATUSES.UNKNOWN}},
  });
  console.debug('Emails on DB:', emailsOnDb.length);
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

  console.debug('Verified emails:', verifiedEmails.length);

  let unverifiedEmails: string[] = emails.filter(
    (email) => !verifiedEmails.some((e) => e.email === email)
  );
  const invalidEntries = unverifiedEmails.filter(
    (email) => !isFormatValid(email)
  );

  unverifiedEmails = unverifiedEmails.filter(
    (email) => isFormatValid(email)
  );
  console.debug('unverified emails:', unverifiedEmails.length);

  console.debug('Invalid emails:', invalidEntries.length);
  if (invalidEntries.length > 0) {
        await sendRequest({
      url: `${hostname}/verifier/webhook`,
      method: 'POST',
      body: {
        emails: invalidEntries,
      },
    });
  }
  console.debug('Verified emails:', verifiedEmails.length);
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
      throw e;
    }
  }
  console.debug('Unverified emails:', unverifiedEmails.length);
  if (unverifiedEmails.length > 0) {
    if (MAIL_VERIFIER_SERVICE === 'clearout') {
      try {
                await bulkClearOut(unverifiedEmails, hostname);
      } catch (e) {
        throw e;
      }
    }

    if (MAIL_VERIFIER_SERVICE === 'mailsso') {
      console.debug('Bulk email verification started, total emails:', emails.length);
      try {
        await bulkMailsso(unverifiedEmails, hostname);
      } catch (e) {
        throw e;
      }
    }
  }
};

