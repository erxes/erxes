import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import { buildTaggedAddress } from '@/integrations/mail/utils/address';
import {
  ICloudflareSendingAccount,
  readSendingAccount,
} from '@/integrations/mail/utils/cloudflare/sending';
import { createCloudflareTransport } from '@/integrations/mail/utils/transports/cloudflare';
import { MailSendError } from '@/integrations/mail/utils/transports/common';
import { deliver } from '@/integrations/mail/utils/transports/deliver';
import { readUsablePlatformAccount } from '@/integrations/mail/utils/platformConfig';
import { checkPlatformSendRate } from '@/integrations/mail/utils/rateLimit';
import {
  IMailTransport,
  ISendMailInput,
  ISendMailResult,
} from '@/integrations/mail/utils/transports/types';

type TMailSigner =
  | { ok: true; account: ICloudflareSendingAccount; metered: boolean }
  | { ok: false; reason: string };

export const resolveReplyToAddress = (
  integration: IMailIntegrationDocument,
  tag?: string,
) =>
  tag ? buildTaggedAddress(integration.address, tag) : integration.address;

const resolveSigner = async (subdomain: string): Promise<TMailSigner> => {
  const lookup = await readSendingAccount(subdomain);

  if (lookup.ok) {
    return { ok: true, account: lookup.account, metered: false };
  }

  const platform = await readUsablePlatformAccount(subdomain);

  if (platform) {
    return { ok: true, account: platform, metered: true };
  }

  return { ok: false, reason: lookup.reason };
};

const resolveTransport = async (
  subdomain: string,
): Promise<IMailTransport> => {
  const signer = await resolveSigner(subdomain);

  if (!signer.ok) {
    throw new MailSendError(signer.reason, false);
  }

  // A platform-managed domain spends the deployment's allowance, so it answers
  // to a cap the workspace's own account does not need.
  if (signer.metered) {
    await checkPlatformSendRate(subdomain);
  }

  return createCloudflareTransport(subdomain, signer.account);
};

export const sendMail = async (
  subdomain: string,
  input: ISendMailInput,
): Promise<ISendMailResult> =>
  await deliver(subdomain, await resolveTransport(subdomain), input);

export {
  buildMessageId,
  isRetryableFailure,
  MailSendError,
} from '@/integrations/mail/utils/transports/common';

export type {
  IMailTransport,
  ISendMailAttachment,
  ISendMailInput,
  ISendMailResult,
} from '@/integrations/mail/utils/transports/types';
