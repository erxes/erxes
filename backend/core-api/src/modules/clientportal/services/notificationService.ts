import { sendEmail } from '~/utils/email';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';

export interface SendEmailOptions {
  toEmails: string[];
  title: string;
  customHtml?: string;
  customHtmlData?: Record<string, any>;
  userId: string;
}

export interface SendSMSOptions {
  toPhone: string;
  message: string;
  userId?: string;
}

export class NotificationService {
  async sendEmail(
    subdomain: string,
    options: SendEmailOptions,
    models: IModels,
  ): Promise<void> {
    await sendEmail(subdomain, options, models);
  }

  async sendSMS(
    subdomain: string,
    options: SendSMSOptions,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    const smsProvidersConfig = clientPortal.smsProvidersConfig;
    const otpConfig = clientPortal.securityAuthConfig?.otpConfig;
    const smsProvider = otpConfig?.sms?.smsProvider || 'callPro';

    if (smsProvider === 'callPro') {
      await this.sendViaCallPro(options, smsProvidersConfig);
    } else if (smsProvider === 'twilio') {
      await this.sendViaTwilio(options, smsProvidersConfig);
    } else {
      throw new Error(`Unsupported SMS provider: ${smsProvider}`);
    }
  }

  private async sendViaCallPro(
    options: SendSMSOptions,
    smsProvidersConfig?: IClientPortalDocument['smsProvidersConfig'],
  ): Promise<void> {
    const callProConfig = smsProvidersConfig?.callPro;

    // Parse if it's a JSON string
    let config: { phone?: string; token?: string } = {};
    if (typeof callProConfig === 'string') {
      try {
        config = JSON.parse(callProConfig);
      } catch {
        config = {};
      }
    } else if (callProConfig) {
      config = callProConfig;
    }

    const MESSAGE_PRO_API_KEY = config.token;
    const MESSAGE_PRO_PHONE_NUMBER = config.phone;

    if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
      throw new Error('messaging config not set properly');
    }

    try {
      const response = await fetch(
        'https://api.messagepro.mn/send?' +
          new URLSearchParams({
            key: MESSAGE_PRO_API_KEY,
            from: MESSAGE_PRO_PHONE_NUMBER,
            to: options.toPhone,
            text: options.message,
          }),
      );
      console.log('response', await response.json());
      if (!response.ok) {
        throw new Error(`MessagePro API error: ${response.statusText}`);
      }

      return;
    } catch (e) {
      const error = e as Error;
      console.error('SMS sending error:', error.message);
      throw new Error(error.message);
    }
  }

  private async sendViaTwilio(
    options: SendSMSOptions,
    smsProvidersConfig?: IClientPortalDocument['smsProvidersConfig'],
  ): Promise<void> {
    const twilioConfig = smsProvidersConfig?.twilio;

    // Parse if it's a JSON string
    let config: { apiKey?: string; apiSecret?: string; apiUrl?: string } = {};
    if (typeof twilioConfig === 'string') {
      try {
        config = JSON.parse(twilioConfig);
      } catch {
        config = {};
      }
    } else if (twilioConfig) {
      config = twilioConfig;
    }

    const accountSid = config.apiKey; // Twilio Account SID
    const authToken = config.apiSecret; // Twilio Auth Token
    const apiUrl = config.apiUrl || 'https://api.twilio.com';

    if (!accountSid || !authToken) {
      throw new Error('Twilio config not set properly');
    }

    try {
      // Create basic auth header with Account SID and Auth Token
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const url = `${apiUrl}/2010-04-01/Accounts/${accountSid}/Messages.json`;

      // Note: Twilio requires a "From" phone number. This should be configured separately
      // For now, we'll use the accountSid as a placeholder, but this needs to be a valid Twilio number
      const formData = new URLSearchParams({
        To: options.toPhone,
        From: accountSid, // TODO: This should be a Twilio phone number from config
        Body: options.message,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Twilio API error: ${response.statusText} - ${JSON.stringify(
            errorData,
          )}`,
        );
      }

      return;
    } catch (e) {
      const error = e as Error;
      console.error('SMS sending error:', error.message);
      throw new Error(error.message);
    }
  }

  async sendOTPEmail(
    subdomain: string,
    user: ICPUserDocument,
    code: string,
    subject: string,
    template: string,
    models: IModels,
  ): Promise<void> {
    if (!user.email || !user._id) {
      return;
    }

    await this.sendEmail(
      subdomain,
      {
        toEmails: [user.email],
        title: subject,
        customHtml: template,
        customHtmlData: { code },
        userId: user._id,
      },
      models,
    );
  }

  async sendOTPSMS(
    subdomain: string,
    user: ICPUserDocument,
    code: string,
    template: string,
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    if (!user.phone) {
      return;
    }

    // Replace {code} placeholder in template if present
    const message = template.replace('{code}', code);

    await this.sendSMS(
      subdomain,
      {
        toPhone: user.phone,
        message,
        userId: user._id,
      },
      clientPortal,
      models,
    );
  }
}

export const notificationService = new NotificationService();
