import { generateModels } from '~/connectionResolvers';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import {
  addressDomain,
  buildTaggedAddress,
} from '@/integrations/mail/utils/address';
import { readSendingAccount } from '@/integrations/mail/utils/cloudflare/sending';
import { describeError } from '@/integrations/mail/utils/errors';
import { createCloudflareTransport } from '@/integrations/mail/utils/transports/cloudflare';
import { MailSendError } from '@/integrations/mail/utils/transports/common';
import { deliver } from '@/integrations/mail/utils/transports/deliver';
import {
  platformMailDomain,
  readPlatformSendingConfig,
  sendingProviderOf,
} from '@/integrations/mail/utils/platformConfig';
import { checkPlatformSendRate } from '@/integrations/mail/utils/rateLimit';
import { createProviderTransport } from '@/integrations/mail/utils/transports/provider';
import {
  IMailTransport,
  ISendMailInput,
  ISendMailResult,
} from '@/integrations/mail/utils/transports/types';

export const resolveSendingAddress = (integration: IMailIntegrationDocument) =>
  integration.sendingAccountId
    ? integration.sendingAddress || integration.address
    : integration.address;

export const resolveReplyToAddress = (
  integration: IMailIntegrationDocument,
  tag?: string,
) => {
  const sending = resolveSendingAddress(integration);

  // A reply has to land back in this inbox. The forwarding address does that
  // as reliably as the inbox address, so an inbox that answers from the very
  // address its mail is forwarded from can keep erxes off the envelope.
  if (integration.forwardFrom && integration.forwardFrom === sending) {
    return sending;
  }

  return tag
    ? buildTaggedAddress(integration.address, tag)
    : integration.address;
};

const resolveTransport = async (
  subdomain: string,
  integration: IMailIntegrationDocument,
): Promise<IMailTransport> => {
  if (integration.sendingAccountId) {
    const models = await generateModels(subdomain);

    const account = await models.MailSendingAccounts.usableOrThrow(
      integration.sendingAccountId,
    ).catch((e: unknown) => {
      throw new MailSendError(describeError(e), false);
    });

    // A platform-managed domain spends the deployment's allowance just as the
    // default sender does, so it answers to the same cap.
    if (account.platformManaged) {
      await checkPlatformSendRate(subdomain);
    }

    return createProviderTransport({
      subdomain,
      cacheKey: String(account._id),
      name: account.name,
      provider: account.provider,
      domain: account.domain,
      config: account.config,
    });
  }

  const from = resolveSendingAddress(integration);
  const domain = addressDomain(from);

  const lookup = await readSendingAccount(subdomain);

  if (lookup.ok && domain === lookup.account.domain) {
    return createCloudflareTransport(subdomain, lookup.account);
  }

  const platform = await readPlatformSendingConfig(subdomain);

  if (platform && domain === platformMailDomain(subdomain)) {
    await checkPlatformSendRate(subdomain);

    return createProviderTransport({
      subdomain,
      cacheKey: `platform:${subdomain}`,
      name: 'erxes',
      provider: sendingProviderOf(platform),
      domain: platformMailDomain(subdomain),
      config: platform,
    });
  }

  throw new MailSendError(
    lookup.ok
      ? `This inbox answers from ${from}, and nothing on this workspace can sign for ${domain} — give it a sending account on that domain, or recreate the inbox on ${lookup.account.domain}`
      : lookup.reason,
    false,
  );
};

export const sendMail = async (
  subdomain: string,
  integration: IMailIntegrationDocument,
  input: ISendMailInput,
): Promise<ISendMailResult> =>
  await deliver(
    subdomain,
    await resolveTransport(subdomain, integration),
    input,
  );

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
