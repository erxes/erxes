import { IMailSendingAccountDocument } from '@/integrations/mail/@types/sending';

export const toPublicSendingAccount = (
  account: IMailSendingAccountDocument,
) => ({
  _id: String(account._id),
  name: account.name,
  provider: account.provider,
  domain: account.domain,
  platformManaged: Boolean(account.platformManaged),
  status: account.status,
  dnsRecords: account.dnsRecords ?? [],
  error: account.error,
  verifiedAt: account.verifiedAt,
  createdAt: account.createdAt,
});
