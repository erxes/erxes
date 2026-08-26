import { resolveTxt } from 'node:dns/promises';
import { randomAlphanumeric } from 'erxes-api-shared/utils';
import { IMailSendingDnsRecord } from '@/integrations/mail/@types/sending';
import {
  MAIL_SENDING_PROOF_HOST,
  MAIL_SENDING_PROOF_LENGTH,
  MAIL_SENDING_PROOF_PREFIX,
} from '@/integrations/mail/constants';
import { debugError } from '@/integrations/mail/debuggers';

export const createProofToken = () =>
  randomAlphanumeric(MAIL_SENDING_PROOF_LENGTH);

const proofHost = (domain: string) =>
  `${MAIL_SENDING_PROOF_HOST}.${domain}`;

const proofValue = (token: string) =>
  `${MAIL_SENDING_PROOF_PREFIX}${token}`;

const buildProofRecord = (
  domain: string,
  token: string,
  valid = false,
): IMailSendingDnsRecord => ({
  type: 'TXT',
  host: proofHost(domain),
  data: proofValue(token),
  valid,
});

export const withProofRecord = (
  records: IMailSendingDnsRecord[],
  domain: string,
  token: string,
  valid: boolean,
): IMailSendingDnsRecord[] => [
  ...records.filter((record) => record.host !== proofHost(domain)),
  buildProofRecord(domain, token, valid),
];

export const readProof = async (
  domain: string,
  token: string,
): Promise<boolean> => {
  const expected = proofValue(token);

  try {
    const answers = await resolveTxt(proofHost(domain));

    return answers.some((chunks) => chunks.join('').trim() === expected);
  } catch (e) {
    debugError(`Could not read the ownership record for ${domain}:`, e);

    return false;
  }
};
