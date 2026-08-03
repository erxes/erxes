export type TEmailProviderName = 'SES' | 'sendgrid' | 'custom';

export interface IEmailAttachment {
  filename: string;
  path?: string;
  content?: string;
  contentType?: string;
}

export interface IOutboundEmail {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: IEmailAttachment[];
  headers?: Record<string, string>;
  customArgs?: Record<string, string>;
}

export interface ISentEmail {
  messageId: string;
  provider: TEmailProviderName;
  accepted: string[];
  rejected: string[];
}

export type TDnsRecordType = 'CNAME' | 'TXT' | 'MX';

export interface IDnsRecord {
  type: TDnsRecordType;
  host: string;
  data: string;
  valid: boolean;
}

export type TSenderStatus = 'pending' | 'verified' | 'failed';

export type TSenderType = 'single' | 'domain';

export interface ISender {
  id: string;
  type: TSenderType;
  value: string;
  name?: string;
  status: TSenderStatus;
  dnsRecords?: IDnsRecord[];
}

export interface ISingleSenderInput {
  email: string;
  name?: string;
  replyTo?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface IEmailProviderConfig {
  DEFAULT_EMAIL_SERVICE?: string;

  AWS_SES_ACCESS_KEY_ID?: string;
  AWS_SES_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_SES_CONFIG_SET?: string;

  SENDGRID_API_KEY?: string;
  SENDGRID_SUBUSER?: string;

  MAIL_SERVICE?: string;
  MAIL_HOST?: string;
  MAIL_PORT?: string;
  MAIL_USER?: string;
  MAIL_PASS?: string;
}

export interface IEmailProvider {
  readonly name: TEmailProviderName;

  send(message: IOutboundEmail): Promise<ISentEmail>;

  listSingleSenders(ids?: string[]): Promise<ISender[]>;
  listAuthenticatedDomains(domains?: string[]): Promise<ISender[]>;

  verifySingleSender(input: ISingleSenderInput): Promise<ISender>;

  removeSender(id: string): Promise<void>;

  authenticateDomain(domain: string): Promise<ISender>;

  validateDomain(id: string): Promise<ISender>;
}

export class EmailProviderNotSupportedError extends Error {
  constructor(provider: string, operation: string) {
    super(
      `"${operation}" is not supported by the "${provider}" email provider`,
    );
    this.name = 'EmailProviderNotSupportedError';
  }
}

export class EmailProviderConfigError extends Error {
  constructor(provider: string, missing: string[]) {
    super(
      `"${provider}" email provider is missing configuration: ${missing.join(
        ', ',
      )}`,
    );
    this.name = 'EmailProviderConfigError';
  }
}

export class EmailProviderRequestError extends Error {
  public status: number;
  public body: string;

  constructor(provider: string, status: number, body: string) {
    super(`"${provider}" API request failed with status ${status}: ${body}`);
    this.name = 'EmailProviderRequestError';
    this.status = status;
    this.body = body;
  }
}
