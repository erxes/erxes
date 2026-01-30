import { sendEmail } from '~/utils/email';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPNotificationDocument } from '@/clientportal/types/cpNotification';
import { firebaseService } from './firebaseService';
import { NetworkError } from './errorHandler';
import { CP_NOTIFICATION_PRIORITY_ORDER } from '../constants';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

type NotificationKind = 'system' | 'user';

interface BaseNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  contentType?: string;
  contentTypeId?: string;
  priority?: NotificationPriority;
  metadata?: any;
  action?: string;
  kind?: NotificationKind;
  allowMultiple?: boolean;
}

interface CreateNotificationInput extends BaseNotificationData {
  cpUserId: string;
  clientPortalId: string;
}

interface SendNotificationInput extends BaseNotificationData {}

interface CallProConfig {
  phone?: string;
  token?: string;
}

interface TwilioConfig {
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
}

interface FirebaseNotificationPayload {
  title: string;
  body: string;
}

function parseJsonConfig<T>(configLike: unknown): T {
  if (!configLike) {
    return {} as T;
  }

  if (typeof configLike === 'string') {
    try {
      return JSON.parse(configLike) as T;
    } catch {
      return {} as T;
    }
  }

  return configLike as T;
}

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

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
    options: SendSMSOptions,
    clientPortal: IClientPortalDocument,
  ): Promise<void> {
    const { smsProvidersConfig, securityAuthConfig } = clientPortal;
    const smsProvider = securityAuthConfig?.otpConfig?.sms?.smsProvider;

    switch (smsProvider) {
      case 'twilio':
        await this.sendViaTwilio(options, smsProvidersConfig);
        break;
      case 'callPro':
      case undefined:
        // Default to callPro when provider is not set
        await this.sendViaCallPro(options, smsProvidersConfig);
        break;
      default:
        throw new Error(`Unsupported SMS provider: ${smsProvider}`);
    }
  }

  private async sendViaCallPro(
    options: SendSMSOptions,
    smsProvidersConfig?: IClientPortalDocument['smsProvidersConfig'],
  ): Promise<void> {
    const callProConfig = smsProvidersConfig?.callPro;
    const config = parseJsonConfig<CallProConfig>(callProConfig);
    const apiKey = config.token;
    const phoneNumber = config.phone;

    if (!apiKey || !phoneNumber) {
      throw new Error('Messaging config not set properly');
    }

    try {
      const response = await fetch(
        'https://api.messagepro.mn/send?' +
          new URLSearchParams({
            key: apiKey,
            from: phoneNumber,
            to: options.toPhone,
            text: options.message,
          }),
      );
      if (!response.ok) {
        throw new Error(`MessagePro API error: ${response.statusText}`);
      }
    } catch (e) {
      const error = e as Error;
      throw new NetworkError(error.message);
    }
  }

  private async sendViaTwilio(
    options: SendSMSOptions,
    smsProvidersConfig?: IClientPortalDocument['smsProvidersConfig'],
  ): Promise<void> {
    const twilioConfig = smsProvidersConfig?.twilio;
    const config = parseJsonConfig<TwilioConfig>(twilioConfig);

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
    } catch (e) {
      const error = e as Error;
      throw new NetworkError(error.message);
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
    user: ICPUserDocument,
    code: string,
    template: string,
    clientPortal: IClientPortalDocument,
  ): Promise<void> {
    if (!user.phone) {
      return;
    }

    // Replace {code} placeholder in template if present
    const message = template.replace('{code}', code);

    await this.sendSMS(
      {
        toPhone: user.phone,
        message,
        userId: user._id,
      },
      clientPortal,
    );
  }

  async sendOTP(
    subdomain: string,
    user: ICPUserDocument,
    identifierType: 'email' | 'phone',
    code: string,
    options: { emailSubject: string; messageTemplate: string },
    clientPortal: IClientPortalDocument,
    models: IModels,
  ): Promise<void> {
    if (identifierType === 'email' && user.email) {
      await this.sendOTPEmail(
        subdomain,
        user,
        code,
        options.emailSubject,
        options.messageTemplate,
        models,
      );
    } else if (identifierType === 'phone' && user.phone) {
      await this.sendOTPSMS(user, code, options.messageTemplate, clientPortal);
    }
  }

  async createNotification(
    subdomain: string,
    models: IModels,
    notificationData: CreateNotificationInput,
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
      expiresAt: new Date(Date.now() + THIRTY_DAYS_IN_MS),
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

  /**
   * Sends Firebase notification to the user's FCM tokens. Returns tokens that
   * failed with revokable errors (invalid/unregistered); caller should remove
   * those from the user's fcmTokens.
   */
  private async sendFirebaseNotification(
    clientPortal: IClientPortalDocument,
    cpUser: ICPUserDocument,
    notification: FirebaseNotificationPayload,
    data?: Record<string, string>,
  ): Promise<string[]> {
    const firebaseConfig = clientPortal.firebaseConfig;

    if (!firebaseConfig?.enabled || !firebaseConfig?.serviceAccountKey) {
      return [];
    }

    const tokens = (cpUser.fcmTokens || []).filter(Boolean);
    if (tokens.length === 0) {
      return [];
    }

    try {
      await firebaseService.initializeFromClientPortal(clientPortal);
      const response = await firebaseService.sendNotification(
        clientPortal._id,
        tokens,
        notification,
        data,
      );
      const toRevoke = firebaseService.getTokensToRevokeFromResponse(
        tokens,
        response,
      );
      return toRevoke;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new NetworkError(
        `Failed to send Firebase notification: ${errorMessage}`,
      );
    }
  }

  async sendNotification(
    subdomain: string,
    models: IModels,
    clientPortal: IClientPortalDocument,
    cpUser: ICPUserDocument,
    notificationData: SendNotificationInput,
  ): Promise<ICPNotificationDocument> {
    const notification = await this.createNotification(subdomain, models, {
      ...notificationData,
      cpUserId: cpUser._id,
      clientPortalId: clientPortal._id,
    });

    try {
      const tokensToRevoke = await this.sendFirebaseNotification(
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

      if (tokensToRevoke.length > 0) {
        await models.CPUser.updateOne(
          { _id: cpUser._id },
          { $pull: { fcmTokens: { $in: tokensToRevoke } } },
        );
      }
    } catch {
      // Swallow Firebase errors so notification creation still succeeds
    }

    return notification;
  }
}

export const notificationService = new NotificationService();
