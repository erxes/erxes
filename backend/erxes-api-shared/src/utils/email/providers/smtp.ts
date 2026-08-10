import * as nodemailer from 'nodemailer';
import {
  EmailProviderNotSupportedError,
  IEmailProvider,
  IEmailProviderConfig,
  IOutboundEmail,
  ISender,
  ISentEmail,
  ISingleSenderInput,
  TEmailProviderName,
} from '../types';

const CONNECTION_TIMEOUT_MS = 15000;
const GREETING_TIMEOUT_MS = 15000;
const SOCKET_TIMEOUT_MS = 30000;

export class SmtpEmailProvider implements IEmailProvider {
  public readonly name: TEmailProviderName = 'custom';

  private transporter: nodemailer.Transporter;

  constructor(config: IEmailProviderConfig) {
    const auth =
      config.MAIL_USER && config.MAIL_PASS
        ? { user: config.MAIL_USER, pass: config.MAIL_PASS }
        : undefined;

    const port = config.MAIL_PORT ? Number(config.MAIL_PORT) : undefined;

    this.transporter = nodemailer.createTransport({
      service: config.MAIL_SERVICE,
      host: config.MAIL_HOST,
      port,
      auth,
      ...(auth && port !== 465 ? { requireTLS: true } : {}),
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
    });
  }

  public async send(message: IOutboundEmail): Promise<ISentEmail> {
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
      headers: { ...(message.headers || {}), ...(message.customArgs || {}) },
    });

    return {
      messageId: info.messageId,
      provider: this.name,
      accepted: (info.accepted || []).map(String),
      rejected: (info.rejected || []).map(String),
    };
  }

  public async listSingleSenders(): Promise<ISender[]> {
    throw new EmailProviderNotSupportedError('custom', 'listSingleSenders');
  }

  public async listAuthenticatedDomains(): Promise<ISender[]> {
    throw new EmailProviderNotSupportedError(
      'custom',
      'listAuthenticatedDomains',
    );
  }

  public async verifySingleSender(
    _input: ISingleSenderInput,
  ): Promise<ISender> {
    throw new EmailProviderNotSupportedError('custom', 'verifySingleSender');
  }

  public async removeSender(_id: string): Promise<void> {
    throw new EmailProviderNotSupportedError('custom', 'removeSender');
  }

  public async authenticateDomain(_domain: string): Promise<ISender> {
    throw new EmailProviderNotSupportedError('custom', 'authenticateDomain');
  }

  public async validateDomain(_id: string): Promise<ISender> {
    throw new EmailProviderNotSupportedError('custom', 'validateDomain');
  }
}
