import fetch from 'node-fetch';
import { toBase64Attachments } from '../attachments';
import { SENDGRID_API_BASE_URL } from '../constants';
import {
  EmailProviderConfigError,
  EmailProviderRequestError,
  IDnsRecord,
  IEmailProvider,
  IEmailProviderConfig,
  IOutboundEmail,
  ISender,
  ISentEmail,
  ISingleSenderInput,
  TEmailProviderName,
} from '../types';

type TSendgridDnsEntry = {
  host: string;
  type: string;
  data: string;
  valid: boolean;
};

type TSendgridDomain = {
  id: number;
  domain: string;
  valid: boolean;
  dns?: Record<string, TSendgridDnsEntry>;
};

type TSendgridVerifiedSender = {
  id: number;
  nickname?: string;
  from_email: string;
  from_name?: string;
  verified: boolean;
};

const toDnsRecords = (dns?: Record<string, TSendgridDnsEntry>): IDnsRecord[] =>
  Object.values(dns || {}).map((entry) => ({
    type: entry.type.toUpperCase() as IDnsRecord['type'],
    host: entry.host,
    data: entry.data,
    valid: entry.valid,
  }));

const toSingleSender = (sender: TSendgridVerifiedSender): ISender => ({
  id: String(sender.id),
  type: 'single',
  value: sender.from_email,
  name: sender.from_name || sender.nickname,
  status: sender.verified ? 'verified' : 'pending',
});

const toDomainSender = (domain: TSendgridDomain): ISender => ({
  id: String(domain.id),
  type: 'domain',
  value: domain.domain,
  status: domain.valid ? 'verified' : 'pending',
  dnsRecords: toDnsRecords(domain.dns),
});

/**
 * The SDK reports only the HTTP reason — "Bad Request" — while what was
 * actually wrong with the payload sits in the response body. A delivery log
 * saying "Bad Request" tells nobody which field to fix.
 */
const toSendError = (error: any) => {
  const response = error?.response;

  if (!response) {
    return error;
  }

  return new EmailProviderRequestError(
    'sendgrid',
    response.statusCode || 0,
    typeof response.body === 'string'
      ? response.body
      : JSON.stringify(response.body),
  );
};

export class SendgridEmailProvider implements IEmailProvider {
  public readonly name: TEmailProviderName = 'sendgrid';

  private apiKey: string;
  private subuser?: string;
  private mailer: any;

  constructor(config: IEmailProviderConfig) {
    if (!config.SENDGRID_API_KEY) {
      throw new EmailProviderConfigError('sendgrid', ['SENDGRID_API_KEY']);
    }

    this.apiKey = config.SENDGRID_API_KEY;
    this.subuser = config.SENDGRID_SUBUSER;

    // Required lazily so that deployments not using SendGrid never pay for
    // loading the SDK.
    const sendgridMail = require('@sendgrid/mail');

    sendgridMail.setApiKey(this.apiKey);

    this.mailer = sendgridMail;
  }

  public async send(message: IOutboundEmail): Promise<ISentEmail> {
    const attachments = message.attachments?.length
      ? await toBase64Attachments(message.attachments)
      : undefined;

    const payload: Record<string, unknown> = {
      from: message.from,
      to: message.to,
      cc: message.cc?.length ? message.cc : undefined,
      bcc: message.bcc?.length ? message.bcc : undefined,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments,
      headers: message.headers,
      customArgs: message.customArgs,
    };

    let response: any;

    try {
      [response] = await this.mailer.send(payload);
    } catch (error) {
      throw toSendError(error);
    }

    const messageId =
      response?.headers?.['x-message-id'] ||
      response?.headers?.['X-Message-Id'] ||
      '';

    return {
      messageId: String(messageId),
      provider: this.name,
      accepted: message.to,
      rejected: [],
    };
  }

  public async listSingleSenders(ids?: string[]): Promise<ISender[]> {
    // `id` takes a single value, so asking for several means one call each.
    const paths = ids?.length
      ? ids.map((id) => `/verified_senders?id=${encodeURIComponent(id)}`)
      : ['/verified_senders'];

    const pages = await Promise.all(
      paths.map((path) =>
        this.request<{ results?: TSendgridVerifiedSender[] }>('GET', path),
      ),
    );

    return pages.flatMap((page) => (page?.results || []).map(toSingleSender));
  }

  public async listAuthenticatedDomains(
    domains?: string[],
  ): Promise<ISender[]> {
    // `domain` takes a single value, so asking for several means one call each.
    const paths = domains?.length
      ? domains.map(
          (domain) =>
            `/whitelabel/domains?domain=${encodeURIComponent(domain)}`,
        )
      : ['/whitelabel/domains'];

    const pages = await Promise.all(
      paths.map((path) => this.request<TSendgridDomain[]>('GET', path)),
    );

    return pages.flatMap((page) => (page || []).map(toDomainSender));
  }

  public async verifySingleSender(input: ISingleSenderInput): Promise<ISender> {
    const created = await this.request<TSendgridVerifiedSender>(
      'POST',
      '/verified_senders',
      {
        nickname: input.name || input.email,
        from_email: input.email,
        from_name: input.name || input.email,
        reply_to: input.replyTo || input.email,
        address: input.address || '',
        city: input.city || '',
        country: input.country || '',
      },
    );

    return {
      id: String(created.id),
      type: 'single',
      value: created.from_email,
      name: created.from_name,
      status: created.verified ? 'verified' : 'pending',
    };
  }

  public async removeSender(id: string): Promise<void> {
    await this.request('DELETE', `/verified_senders/${id}`);
  }

  public async authenticateDomain(domain: string): Promise<ISender> {
    const created = await this.request<TSendgridDomain>(
      'POST',
      '/whitelabel/domains',
      {
        domain,
        // Lets SendGrid manage the DKIM keys behind CNAMEs, so the customer
        // never has to rotate a TXT record by hand.
        automatic_security: true,
      },
    );

    return toDomainSender(created);
  }

  public async validateDomain(id: string): Promise<ISender> {
    await this.request('POST', `/whitelabel/domains/${id}/validate`);

    const domain = await this.request<TSendgridDomain>(
      'GET',
      `/whitelabel/domains/${id}`,
    );

    return toDomainSender(domain);
  }

  private async request<TResponse = unknown>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<TResponse> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    // Scopes every management call to the tenant's subuser, so one tenant can
    // never read or delete another tenant's senders.
    if (this.subuser) {
      headers['on-behalf-of'] = this.subuser;
    }

    const response = await fetch(`${SENDGRID_API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new EmailProviderRequestError(
        'sendgrid',
        response.status,
        await response.text(),
      );
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const text = await response.text();

    if (!text) {
      return undefined as TResponse;
    }

    return JSON.parse(text) as TResponse;
  }
}
