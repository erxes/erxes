import { sendEmail as sendEmailUtil } from '~/utils/email';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPNotificationDocument } from '@/clientportal/types/cpNotification';
import { firebaseService } from './firebaseService';
import { NetworkError } from '@/clientportal/services/errorHandler';
import { CP_NOTIFICATION_PRIORITY_ORDER } from '@/clientportal/constants';
import * as Handlebars from 'handlebars';

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
  /** Result of sending push: which platforms had FCM tokens */
  result?: { ios?: boolean; android?: boolean; web?: boolean };
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

function normalizeLegacyOTPPlaceholders(template: string): string {
  return template.replace(/\{code\}/g, '{{code}}');
}

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

async function sendViaCallPro(
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

async function sendViaTwilio(
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
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const url = `${apiUrl}/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams({
      To: options.toPhone,
      From: accountSid,
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

export type FirebaseSendStatus =
  | 'sent'
  | 'not_configured'
  | 'no_tokens'
  | 'error';

export interface FirebaseSendResult {
  status: FirebaseSendStatus;
  tokensToRevoke: string[];
}

async function sendFirebaseNotification(
  clientPortal: IClientPortalDocument,
  cpUser: ICPUserDocument,
  notification: FirebaseNotificationPayload,
  data?: Record<string, string>,
): Promise<FirebaseSendResult> {
  const firebaseConfig = clientPortal.firebaseConfig;

  if (!firebaseConfig?.enabled || !firebaseConfig?.serviceAccountKey) {
    return { status: 'not_configured', tokensToRevoke: [] };
  }

  const tokenStrings = (cpUser.fcmTokens || [])
    .filter((d) => d?.token)
    .map((d) => d.token);
  if (tokenStrings.length === 0) {
    return { status: 'no_tokens', tokensToRevoke: [] };
  }

  try {
    await firebaseService.initializeFromClientPortal(clientPortal);
    const response = await firebaseService.sendNotification(
      clientPortal._id,
      tokenStrings,
      notification,
      data,
    );
    const tokensToRevoke = firebaseService.getTokensToRevokeFromResponse(
      tokenStrings,
      response,
    );
    return { status: 'sent', tokensToRevoke };
  } catch {
    return { status: 'error', tokensToRevoke: [] };
  }
}

export async function sendEmail(
  subdomain: string,
  options: SendEmailOptions,
  models: IModels,
): Promise<void> {
  await sendEmailUtil(subdomain, options, models);
}

export async function sendSMS(
  options: SendSMSOptions,
  clientPortal: IClientPortalDocument,
): Promise<void> {
  const { smsProvidersConfig, securityAuthConfig } = clientPortal;
  const smsProvider = securityAuthConfig?.otpConfig?.sms?.smsProvider;

  switch (smsProvider) {
    case 'twilio':
      await sendViaTwilio(options, smsProvidersConfig);
      break;
    case 'callPro':
    case undefined:
      await sendViaCallPro(options, smsProvidersConfig);
      break;
    default:
      throw new Error(`Unsupported SMS provider: ${smsProvider}`);
  }
}

export async function sendOTPEmail(
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

  await sendEmail(
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

export async function sendOTPSMS(
  user: ICPUserDocument,
  code: string,
  template: string,
  clientPortal: IClientPortalDocument,
): Promise<void> {
  if (!user.phone) {
    return;
  }

  const templateData = { code };
  const normalizedTemplate = normalizeLegacyOTPPlaceholders(template);
  const message = Handlebars.compile(normalizedTemplate)(templateData);

  await sendSMS(
    {
      toPhone: user.phone,
      message,
      userId: user._id,
    },
    clientPortal,
  );
}

export async function sendOTP(
  subdomain: string,
  user: ICPUserDocument,
  identifierType: 'email' | 'phone',
  code: string,
  options: { emailSubject: string; messageTemplate: string },
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<void> {
  if (identifierType === 'email' && user.email) {
    await sendOTPEmail(
      subdomain,
      user,
      code,
      options.emailSubject,
      options.messageTemplate,
      models,
    );
  } else if (identifierType === 'phone' && user.phone) {
    await sendOTPSMS(user, code, options.messageTemplate, clientPortal);
  }
}

export async function createNotification(
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
    result,
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

  if (result !== undefined) notificationDoc.result = result;

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

export interface CreateNotificationsBulkInput extends BaseNotificationData {
  clientPortalId: string;
  cpUserIds: string[];
}

export async function createNotificationsBulk(
  subdomain: string,
  models: IModels,
  input: CreateNotificationsBulkInput,
): Promise<Array<{ cpUserId: string; notification: ICPNotificationDocument }>> {
  const {
    clientPortalId,
    cpUserIds,
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
  } = input;

  if (cpUserIds.length === 0) {
    return [];
  }

  const baseDoc: Record<string, unknown> = {
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

  const useUpsert =
    kind === 'user' && !allowMultiple && Boolean(contentType && contentTypeId);

  if (useUpsert) {
    const bulkOps = cpUserIds.map((cpUserId) => ({
      updateOne: {
        filter: { contentTypeId, contentType, cpUserId },
        update: {
          $set: {
            ...baseDoc,
            cpUserId,
          },
        },
        upsert: true,
      },
    }));

    await models.CPNotifications.bulkWrite(bulkOps);

    const notifications = await models.CPNotifications.find({
      $or: cpUserIds.map((id) => ({
        contentTypeId,
        contentType,
        cpUserId: id,
      })),
    }).lean();

    const byUserId = new Map<string, ICPNotificationDocument>();
    for (const n of notifications) {
      const doc = n as ICPNotificationDocument;
      byUserId.set(doc.cpUserId, doc);
    }

    return cpUserIds
      .filter((id) => byUserId.has(id))
      .map((cpUserId) => ({
        cpUserId,
        notification: byUserId.get(cpUserId)!,
      }));
  }

  const docs = cpUserIds.map((cpUserId) => ({
    ...baseDoc,
    cpUserId,
  }));

  const inserted = await models.CPNotifications.insertMany(docs);
  const list = Array.isArray(inserted) ? inserted : [inserted];

  return list.map((notification, index) => ({
    cpUserId: cpUserIds[index],
    notification: notification as ICPNotificationDocument,
  }));
}

export interface SendNotificationBulkResult {
  count: number;
}

export async function sendNotificationBulk(
  subdomain: string,
  models: IModels,
  clientPortal: IClientPortalDocument,
  cpUsers: ICPUserDocument[],
  notificationData: SendNotificationInput,
): Promise<SendNotificationBulkResult> {
  if (cpUsers.length === 0) {
    return { count: 0 };
  }

  const clientPortalId = clientPortal._id;
  const cpUserIds = cpUsers.map((u) => u._id);

  const pairs = await createNotificationsBulk(subdomain, models, {
    clientPortalId,
    cpUserIds,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    contentType: notificationData.contentType,
    contentTypeId: notificationData.contentTypeId,
    priority: notificationData.priority,
    metadata: notificationData.metadata,
    action: notificationData.action,
    kind: notificationData.kind,
    allowMultiple: notificationData.allowMultiple,
  });

  const notificationByUserId = new Map(
    pairs.map((p) => [p.cpUserId, p.notification]),
  );

  const firebaseResults = await Promise.all(
    cpUsers.map((cpUser) => {
      const notification = notificationByUserId.get(cpUser._id);
      if (!notification) {
        return Promise.resolve({
          status: 'not_configured' as const,
          tokensToRevoke: [] as string[],
        });
      }
      return sendFirebaseNotification(
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
    }),
  );

  const notificationUpdates: Array<{
    _id: string;
    result: { ios: boolean; android: boolean; web: boolean };
  }> = [];
  const userTokenRevokes: Array<{ _id: string; tokensToRevoke: string[] }> = [];

  for (let i = 0; i < cpUsers.length; i++) {
    const cpUser = cpUsers[i];
    const notification = notificationByUserId.get(cpUser._id);
    if (!notification) continue;

    const { status, tokensToRevoke } = firebaseResults[i];

    if (status === 'sent') {
      const resultAfterSend = getResultAfterSend(cpUser, tokensToRevoke);
      notificationUpdates.push({
        _id: notification._id,
        result: resultAfterSend,
      });
    } else if (status === 'error') {
      notificationUpdates.push({
        _id: notification._id,
        result: { android: false, ios: false, web: false },
      });
    }

    if (tokensToRevoke.length > 0) {
      userTokenRevokes.push({ _id: cpUser._id, tokensToRevoke });
    }
  }

  if (notificationUpdates.length > 0) {
    await models.CPNotifications.bulkWrite(
      notificationUpdates.map(({ _id, result }) => ({
        updateOne: {
          filter: { _id },
          update: { $set: { result } },
        },
      })),
    );
  }

  if (userTokenRevokes.length > 0) {
    await models.CPUser.bulkWrite(
      userTokenRevokes.map(({ _id, tokensToRevoke }) => ({
        updateOne: {
          filter: { _id },
          update: {
            $pull: { fcmTokens: { token: { $in: tokensToRevoke } } },
          },
        },
      })),
    );
  }

  return { count: cpUsers.length };
}

function getResultFromFcmTokens(cpUser: ICPUserDocument): {
  ios: boolean;
  android: boolean;
  web: boolean;
} {
  const tokens = (cpUser.fcmTokens || []).filter((d) =>
    Boolean(d?.token && d?.platform),
  );
  return {
    android: tokens.some((t) => t.platform === 'android'),
    ios: tokens.some((t) => t.platform === 'ios'),
    web: tokens.some((t) => t.platform === 'web'),
  };
}

/**
 * Computes result after Firebase send: for each platform, true if at least one
 * token for that platform was not in tokensToRevoke (i.e. send accepted or
 * non-revokable failure). Uses cpUser.fcmTokens to map token -> platform.
 */
function getResultAfterSend(
  cpUser: ICPUserDocument,
  tokensToRevoke: string[],
): { ios: boolean; android: boolean; web: boolean } {
  const revokedSet = new Set(tokensToRevoke);
  const tokensWithPlatform = (cpUser.fcmTokens || []).filter((d) =>
    Boolean(d?.token && d?.platform),
  );

  const hasSuccessfulToken = (platform: 'android' | 'ios' | 'web') =>
    tokensWithPlatform.some(
      (t) => t.platform === platform && !revokedSet.has(t.token),
    );

  return {
    android: hasSuccessfulToken('android'),
    ios: hasSuccessfulToken('ios'),
    web: hasSuccessfulToken('web'),
  };
}

export async function sendNotification(
  subdomain: string,
  models: IModels,
  clientPortal: IClientPortalDocument,
  cpUser: ICPUserDocument,
  notificationData: SendNotificationInput,
): Promise<ICPNotificationDocument> {
  const notification = await createNotification(subdomain, models, {
    ...notificationData,
    cpUserId: cpUser._id,
    clientPortalId: clientPortal._id,
  });

  const { status, tokensToRevoke } = await sendFirebaseNotification(
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

  if (status === 'sent') {
    const resultAfterSend = getResultAfterSend(cpUser, tokensToRevoke);
    await models.CPNotifications.updateOne(
      { _id: notification._id },
      { $set: { result: resultAfterSend } },
    );
    notification.result = resultAfterSend;
  } else if (status === 'error') {
    await models.CPNotifications.updateOne(
      { _id: notification._id },
      {
        $set: {
          result: { android: false, ios: false, web: false },
        },
      },
    );
    notification.result = {
      android: false,
      ios: false,
      web: false,
    };
  }

  if (tokensToRevoke.length > 0) {
    await models.CPUser.updateOne(
      { _id: cpUser._id },
      { $pull: { fcmTokens: { token: { $in: tokensToRevoke } } } },
    );
  }

  return notification;
}
