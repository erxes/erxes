import { sendEmail } from '~/utils/email';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPNotificationDocument } from '@/clientportal/types/cpNotification';
import { ICPNotificationConfigDocument } from '@/clientportal/types/cpNotificationConfig';
import { firebaseService } from './firebaseService';
import {
  CP_NOTIFICATION_PRIORITY_ORDER,
  CP_NOTIFICATION_KIND,
} from '../constants';

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

  async createNotification(
    subdomain: string,
    models: IModels,
    notificationData: {
      cpUserId: string;
      clientPortalId: string;
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      contentType?: string;
      contentTypeId?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      metadata?: any;
      action?: string;
      kind?: 'system' | 'user';
      allowMultiple?: boolean;
    },
  ): Promise<ICPNotificationDocument> {
    const {
      cpUserId,
      clientPortalId,
      title,
      message,
      type = 'info',
      contentType,
      contentTypeId,
      priority = 'medium',
      metadata,
      action,
      kind = 'user',
      allowMultiple = false,
    } = notificationData;

    const notificationDoc: any = {
      cpUserId,
      clientPortalId,
      title,
      message,
      type,
      contentType,
      contentTypeId,
      priority,
      priorityLevel: CP_NOTIFICATION_PRIORITY_ORDER[priority],
      metadata,
      action,
      kind,
      isRead: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    let notification: ICPNotificationDocument | null = null;

    if (kind === 'user' && !allowMultiple && contentType && contentTypeId) {
      notification = await models.CPNotifications.findOneAndUpdate(
        { contentTypeId, contentType, cpUserId },
        notificationDoc,
        { new: true, upsert: true },
      );
    }

    if (!notification) {
      notification = await models.CPNotifications.create(notificationDoc);
    }

    return notification;
  }

  async sendFirebaseNotification(
    clientPortal: IClientPortalDocument,
    cpUser: ICPUserDocument,
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<void> {
    const firebaseConfig = clientPortal.firebaseConfig;

    if (!firebaseConfig?.enabled || !firebaseConfig?.serviceAccountKey) {
      return;
    }

    if (!cpUser.fcmTokens || cpUser.fcmTokens.length === 0) {
      return;
    }

    try {
      await firebaseService.initializeFromClientPortal(clientPortal);
      await firebaseService.sendNotification(
        clientPortal._id,
        cpUser.fcmTokens,
        notification,
        data,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send Firebase notification: ${errorMessage}`);
    }
  }

  async sendNotification(
    subdomain: string,
    models: IModels,
    clientPortal: IClientPortalDocument,
    cpUser: ICPUserDocument,
    notificationData: {
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      contentType?: string;
      contentTypeId?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      metadata?: any;
      action?: string;
      kind?: 'system' | 'user';
      allowMultiple?: boolean;
    },
  ): Promise<ICPNotificationDocument> {
    const notification = await this.createNotification(subdomain, models, {
      ...notificationData,
      cpUserId: cpUser._id,
      clientPortalId: clientPortal._id,
    });

    const firebaseConfig = clientPortal.firebaseConfig;
    if (firebaseConfig?.enabled && cpUser.fcmTokens?.length > 0) {
      try {
        await this.sendFirebaseNotification(
          clientPortal,
          cpUser,
          {
            title: notificationData.title,
            body: notificationData.message,
          },
          {
            notificationId: notification._id,
            type: notificationData.type || 'info',
            action: notificationData.action || '',
          },
        );
      } catch (error) {
        // Log error but don't fail the notification creation
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Firebase notification error:', errorMessage);
      }
    }

    return notification;
  }

  async getNotificationConfig(
    models: IModels,
    clientPortalId: string,
    eventType: string,
  ): Promise<ICPNotificationConfigDocument | null> {
    return models.CPNotificationConfigs.findOne({
      clientPortalId,
      eventType,
    });
  }

  async checkNotificationEnabled(
    models: IModels,
    clientPortalId: string,
    eventType: string,
  ): Promise<{
    inAppEnabled: boolean;
    firebaseEnabled: boolean;
    template?: { title?: string; message?: string };
  }> {
    const config = await this.getNotificationConfig(
      models,
      clientPortalId,
      eventType,
    );

    if (!config) {
      return {
        inAppEnabled: true,
        firebaseEnabled: false,
      };
    }

    return {
      inAppEnabled: config.inAppEnabled,
      firebaseEnabled: config.firebaseEnabled,
      template: config.template,
    };
  }
}

export const notificationService = new NotificationService();
