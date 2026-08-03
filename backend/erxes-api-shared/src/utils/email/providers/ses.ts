import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { SES_DKIM_CNAME_SUFFIX } from '../constants';
import {
  EmailProviderConfigError,
  IDnsRecord,
  IEmailProvider,
  IEmailProviderConfig,
  IOutboundEmail,
  ISender,
  ISentEmail,
  ISingleSenderInput,
  TEmailProviderName,
  TSenderStatus,
} from '../types';

const toSenderStatus = (verificationStatus?: string): TSenderStatus => {
  if (verificationStatus === 'Success') {
    return 'verified';
  }

  if (
    verificationStatus === 'Failed' ||
    verificationStatus === 'TemporaryFailure'
  ) {
    return 'failed';
  }

  return 'pending';
};

export class SesEmailProvider implements IEmailProvider {
  public readonly name: TEmailProviderName = 'SES';

  private client: AWS.SES;
  private configSet?: string;
  private transporter: nodemailer.Transporter;

  constructor(config: IEmailProviderConfig) {
    const missing: string[] = [];

    if (!config.AWS_SES_ACCESS_KEY_ID) {
      missing.push('AWS_SES_ACCESS_KEY_ID');
    }

    if (!config.AWS_SES_SECRET_ACCESS_KEY) {
      missing.push('AWS_SES_SECRET_ACCESS_KEY');
    }

    if (!config.AWS_REGION) {
      missing.push('AWS_REGION');
    }

    if (missing.length) {
      throw new EmailProviderConfigError('SES', missing);
    }

    this.configSet = config.AWS_SES_CONFIG_SET;

    this.client = new AWS.SES({
      apiVersion: '2010-12-01',
      region: config.AWS_REGION,
      accessKeyId: config.AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SES_SECRET_ACCESS_KEY,
    });

    this.transporter = nodemailer.createTransport({
      SES: this.client,
    } as nodemailer.TransportOptions);
  }

  public async send(message: IOutboundEmail): Promise<ISentEmail> {
    const headers: Record<string, string> = {
      ...(this.configSet
        ? { 'X-SES-CONFIGURATION-SET': this.configSet }
        : {}),
      ...(message.headers || {}),
    };

    for (const [key, value] of Object.entries(message.customArgs || {})) {
      headers[key] = value;
    }

    const info = await this.transporter.sendMail({
      from: message.from,
      to: message.to.join(', '),
      cc: message.cc?.length ? message.cc.join(', ') : undefined,
      bcc: message.bcc?.length ? message.bcc.join(', ') : undefined,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments?.map((attachment) => ({
        filename: attachment.filename,
        path: attachment.path,
        content: attachment.content
          ? Buffer.from(attachment.content, 'base64')
          : undefined,
        contentType: attachment.contentType,
      })),
      headers,
    });

    return {
      messageId: info.messageId,
      provider: this.name,
      accepted: (info.accepted || []).map(String),
      rejected: (info.rejected || []).map(String),
    };
  }

  public async listSingleSenders(ids?: string[]): Promise<ISender[]> {
    const emails = ids ?? (await this.listAllIdentities('EmailAddress'));

    if (!emails.length) {
      return [];
    }

    const statuses = await this.getVerificationStatuses(emails);

    return emails.map((email) => ({
      id: email,
      type: 'single' as const,
      value: email,
      status: toSenderStatus(statuses[email]),
    }));
  }

  public async listAuthenticatedDomains(
    domains?: string[],
  ): Promise<ISender[]> {
    const names = domains ?? (await this.listAllIdentities('Domain'));

    return Promise.all(names.map((domain) => this.getDomainSender(domain)));
  }

  private async listAllIdentities(
    identityType: 'EmailAddress' | 'Domain',
  ): Promise<string[]> {
    const identities: string[] = [];

    let nextToken: string | undefined;

    do {
      const page = await this.client
        .listIdentities({
          IdentityType: identityType,
          MaxItems: 100,
          NextToken: nextToken,
        })
        .promise();

      identities.push(...(page.Identities ?? []));

      nextToken = page.NextToken;
    } while (nextToken);

    return identities;
  }

  private async getVerificationStatuses(
    identities: string[],
  ): Promise<Record<string, string | undefined>> {
    const statuses: Record<string, string | undefined> = {};

    for (let i = 0; i < identities.length; i += 100) {
      const attributes = await this.client
        .getIdentityVerificationAttributes({
          Identities: identities.slice(i, i + 100),
        })
        .promise();

      for (const [identity, attribute] of Object.entries(
        attributes.VerificationAttributes ?? {},
      )) {
        statuses[identity] = attribute.VerificationStatus;
      }
    }

    return statuses;
  }

  public async verifySingleSender(input: ISingleSenderInput): Promise<ISender> {
    await this.client
      .verifyEmailAddress({ EmailAddress: input.email })
      .promise();

    return {
      id: input.email,
      type: 'single',
      value: input.email,
      name: input.name,
      status: 'pending',
    };
  }

  public async removeSender(id: string): Promise<void> {
    await this.client.deleteIdentity({ Identity: id }).promise();
  }

  public async authenticateDomain(domain: string): Promise<ISender> {
    await this.client.verifyDomainIdentity({ Domain: domain }).promise();

    const dkim = await this.client
      .verifyDomainDkim({ Domain: domain })
      .promise();

    const dnsRecords: IDnsRecord[] = (dkim.DkimTokens || []).map((token) => ({
      type: 'CNAME',
      host: `${token}._domainkey.${domain}`,
      data: `${token}.${SES_DKIM_CNAME_SUFFIX}`,
      valid: false,
    }));

    return {
      id: domain,
      type: 'domain',
      value: domain,
      status: 'pending',
      dnsRecords,
    };
  }

  public async validateDomain(id: string): Promise<ISender> {
    return this.getDomainSender(id);
  }

  private async getDomainSender(domain: string): Promise<ISender> {
    const dkim = await this.client
      .getIdentityDkimAttributes({ Identities: [domain] })
      .promise();

    const attributes = dkim.DkimAttributes?.[domain];

    const dnsRecords: IDnsRecord[] = (attributes?.DkimTokens || []).map(
      (token) => ({
        type: 'CNAME' as const,
        host: `${token}._domainkey.${domain}`,
        data: `${token}.${SES_DKIM_CNAME_SUFFIX}`,
        valid: attributes?.DkimVerificationStatus === 'Success',
      }),
    );

    return {
      id: domain,
      type: 'domain',
      value: domain,
      status: toSenderStatus(attributes?.DkimVerificationStatus),
      dnsRecords,
    };
  }
}
