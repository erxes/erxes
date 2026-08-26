import { Model } from 'mongoose';
import {
  createEmailProvider,
  IEmailProviderConfig,
  ISender,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  IMailSendingAccount,
  IMailSendingAccountDocument,
  IMailSendingAccountInput,
  IMailSendingDnsRecord,
} from '@/integrations/mail/@types/sending';
import { MAIL_SENDING_STATUSES } from '@/integrations/mail/constants';
import { mailSendingAccountSchema } from '@/integrations/mail/db/definitions/sending';
import { describeError } from '@/integrations/mail/utils/errors';
import {
  createProofToken,
  readProof,
  withProofRecord,
} from '@/integrations/mail/utils/dnsProof';
import {
  readPlatformSendingConfig,
  sendingProviderOf,
} from '@/integrations/mail/utils/platformConfig';

export interface IMailSendingAccountModel
  extends Model<IMailSendingAccountDocument> {
  add(
    input: IMailSendingAccountInput,
    subdomain: string,
  ): Promise<IMailSendingAccountDocument>;
  verify(_id: string): Promise<IMailSendingAccountDocument>;
  remove(_id: string): Promise<boolean>;
  usableOrThrow(_id: string): Promise<IMailSendingAccountDocument>;
}

const normalizeDomain = (value: string) =>
  (value || '').trim().toLowerCase().replace(/^@+/, '');

const hasOwnCredentials = (input: IMailSendingAccountInput) =>
  Boolean(input.sendgridApiKey?.trim() || input.awsAccessKeyId?.trim());

const chosenProvider = (input: IMailSendingAccountInput) =>
  input.provider ?? (input.sendgridApiKey?.trim() ? 'sendgrid' : 'SES');

const toConfig = (input: IMailSendingAccountInput): IEmailProviderConfig => {
  if (chosenProvider(input) === 'sendgrid') {
    if (!input.sendgridApiKey?.trim()) {
      throw new Error('A SendGrid API key is required');
    }

    return {
      DEFAULT_EMAIL_SERVICE: 'sendgrid',
      SENDGRID_API_KEY: input.sendgridApiKey.trim(),
    };
  }

  if (!input.awsAccessKeyId?.trim() || !input.awsSecretAccessKey?.trim()) {
    throw new Error('An AWS access key id and secret are required');
  }

  if (!input.awsRegion?.trim()) {
    throw new Error(
      'An AWS region is required — SES identities live in one region',
    );
  }

  return {
    DEFAULT_EMAIL_SERVICE: 'SES',
    AWS_SES_ACCESS_KEY_ID: input.awsAccessKeyId.trim(),
    AWS_SES_SECRET_ACCESS_KEY: input.awsSecretAccessKey.trim(),
    AWS_REGION: input.awsRegion.trim(),
  };
};

const platformConfigOrThrow = async (subdomain: string) => {
  const config = await readPlatformSendingConfig(subdomain);

  if (!config) {
    throw new Error(
      'This deployment has no sending provider of its own — add SES or SendGrid credentials for this domain, or set MAIL_SENDING_* on the server',
    );
  }

  return config;
};

const toDnsRecords = (sender: ISender): IMailSendingDnsRecord[] =>
  (sender.dnsRecords ?? []).map((record) => ({
    type: record.type,
    host: record.host,
    data: record.data,
    valid: Boolean(record.valid),
  }));

const describePending = (domain: string, signed: boolean, owned: boolean) => {
  if (!signed && !owned) {
    return `None of the records for ${domain} are visible yet — add every record above, then check again. DNS can take a few hours.`;
  }

  if (!owned) {
    return `The ownership record for ${domain} is not visible yet — add the TXT record above, then check again`;
  }

  return 'The provider cannot see every DKIM record yet — DNS can take a few hours';
};

export const loadMailSendingAccountClass = (models: IModels) => {
  // skipcq: JS-0327
  class SendingAccount {
    public static async add(
      input: IMailSendingAccountInput,
      subdomain: string,
    ) {
      const domain = normalizeDomain(input.domain);
      const name = (input.name || '').trim();

      if (!domain || domain.includes('@') || !domain.includes('.')) {
        throw new Error(`"${input.domain}" is not a domain`);
      }

      if (!name) {
        throw new Error('A name is required');
      }

      if (await models.MailSendingAccounts.exists({ domain })) {
        throw new Error(
          `${domain} already has a sending account — edit that one instead`,
        );
      }

      const own = hasOwnCredentials(input);

      const config = own
        ? toConfig(input)
        : await platformConfigOrThrow(subdomain);

      const provider = sendingProviderOf(config);

      let sender: ISender;

      try {
        sender = await createEmailProvider(config).authenticateDomain(domain);
      } catch (e) {
        throw new Error(
          `${provider} would not accept ${domain}: ${describeError(e)}`,
        );
      }

      const records = toDnsRecords(sender);
      const signed = sender.status === MAIL_SENDING_STATUSES.VERIFIED;

      // Workspace credentials already prove control of the provider account.
      // The deployment account is shared, so its DKIM state says nothing about
      // who owns the domain — that takes a token only this workspace was given.
      const verifyToken = own ? undefined : createProofToken();
      const verified = own && signed;

      const doc: IMailSendingAccount = {
        name,
        provider,
        domain,
        config,
        platformManaged: !own,
        verifyToken,
        senderId: sender.id,
        status: verified
          ? MAIL_SENDING_STATUSES.VERIFIED
          : MAIL_SENDING_STATUSES.PENDING,
        dnsRecords: verifyToken
          ? withProofRecord(records, domain, verifyToken, false)
          : records,
        verifiedAt: verified ? new Date() : undefined,
      };

      return await models.MailSendingAccounts.create(doc);
    }

    public static async verify(_id: string) {
      const account = await models.MailSendingAccounts.findOne({ _id });

      if (!account) {
        throw new Error('Sending account not found');
      }

      if (!account.senderId) {
        throw new Error(
          `${account.domain} was never registered with ${account.provider} — remove this account and add it again`,
        );
      }

      const patch: Partial<IMailSendingAccount> = { updatedAt: new Date() };

      try {
        const sender = await createEmailProvider(account.config).validateDomain(
          account.senderId,
        );

        const signed = sender.status === MAIL_SENDING_STATUSES.VERIFIED;

        const owned = account.platformManaged
          ? await readProof(account.domain, account.verifyToken ?? '')
          : true;

        const verified = signed && owned;

        const records = sender.dnsRecords?.length
          ? toDnsRecords(sender)
          : (account.dnsRecords ?? []);

        patch.status = verified
          ? MAIL_SENDING_STATUSES.VERIFIED
          : MAIL_SENDING_STATUSES.PENDING;
        patch.dnsRecords = account.verifyToken
          ? withProofRecord(
              records,
              account.domain,
              account.verifyToken,
              owned,
            )
          : records;
        patch.error = verified
          ? ''
          : describePending(account.domain, signed, owned);
        patch.verifiedAt = verified ? new Date() : undefined;
      } catch (e) {
        patch.status = MAIL_SENDING_STATUSES.FAILED;
        patch.error = describeError(e);
      }

      await models.MailSendingAccounts.updateOne({ _id }, { $set: patch });

      return (await models.MailSendingAccounts.findOne({
        _id,
      })) as IMailSendingAccountDocument;
    }

    public static async remove(_id: string) {
      const used = await models.MailIntegrations.countDocuments({
        sendingAccountId: _id,
      });

      if (used) {
        throw new Error(
          `${used} inbox${
            used > 1 ? 'es' : ''
          } still reply through this account — move them to another sender first`,
        );
      }

      await models.MailSendingAccounts.deleteOne({ _id });

      return true;
    }

    public static async usableOrThrow(_id: string) {
      const account = await models.MailSendingAccounts.findOne({ _id });

      if (!account) {
        throw new Error(
          'The sending account this inbox replies through no longer exists',
        );
      }

      if (account.status !== MAIL_SENDING_STATUSES.VERIFIED) {
        throw new Error(
          `${account.domain} is not verified yet — add its DNS records, then press "Check again"`,
        );
      }

      return account;
    }
  }

  mailSendingAccountSchema.loadClass(SendingAccount);

  return mailSendingAccountSchema;
};
