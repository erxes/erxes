import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import {
  createNotificationsBulk,
  notificationService,
} from '@/clientportal/services/notification';
import { firebaseService } from '@/clientportal/services/notification/firebaseService';
import { IEngageMessageDocument } from '@/broadcast/@types';
import { generateModels } from '~/connectionResolvers';

const FAILURE_THRESHOLD = 0.8;

interface NotificationProcessorPayload {
  subdomain: string;
  engageMessage: IEngageMessageDocument;
  clientPortal: IClientPortalDocument;
  cpUsers: ICPUserDocument[];
}

const sendFirebasePush = async (
  clientPortal: IClientPortalDocument,
  cpUser: ICPUserDocument,
  title: string,
  message: string,
  data?: Record<string, string>,
) => {
  const firebaseConfig = clientPortal.firebaseConfig;

  if (!firebaseConfig?.enabled || !firebaseConfig?.serviceAccountKey) {
    return { status: 'not_configured' as const };
  }

  const tokenStrings = (cpUser.fcmTokens || [])
    .filter((device) => device?.token)
    .map((device) => device.token);

  if (tokenStrings.length === 0) {
    return { status: 'no_tokens' as const };
  }

  await firebaseService.initializeFromClientPortal(clientPortal);
  await firebaseService.sendNotification(
    clientPortal._id,
    tokenStrings,
    { title, body: message },
    data,
  );

  return { status: 'sent' as const };
};

const buildNotificationData = (engageMessage: IEngageMessageDocument) => ({
  title: engageMessage.notification?.title || '',
  message: engageMessage.notification?.content || '',
  type: 'info' as const,
  contentType: 'core:broadcast',
  contentTypeId: engageMessage._id,
  kind: 'system' as const,
  allowMultiple: true,
});

export const handleNotificationProcessor = async (
  payload: NotificationProcessorPayload,
) => {
  const { subdomain, engageMessage, clientPortal, cpUsers } = payload ?? {};

  const models = await generateModels(subdomain);

  const inApp = engageMessage.notification?.inApp !== false;
  const isMobile = engageMessage.notification?.isMobile === true;
  const notificationData = buildNotificationData(engageMessage);

  const STATS = { successCount: 0, failureCount: 0 };

  try {
    if (!inApp && !isMobile) {
      STATS.failureCount = cpUsers.length;

      await models.BroadcastTraces.createTrace(
        engageMessage._id,
        'regular',
        'Skipped batch: no notification channels enabled',
      );
    } else if (inApp && isMobile) {
      await notificationService.sendNotificationBulk(
        subdomain,
        models,
        clientPortal,
        cpUsers,
        notificationData,
      );

      STATS.successCount = cpUsers.length;

      for (const cpUser of cpUsers) {
        await models.BroadcastTraces.createTrace(
          engageMessage._id,
          'success',
          `Sent notification to client portal user: ${cpUser._id}`,
        );
      }
    } else if (inApp) {
      await createNotificationsBulk(subdomain, models, {
        clientPortalId: clientPortal._id,
        cpUserIds: cpUsers.map((cpUser) => cpUser._id),
        ...notificationData,
      });

      STATS.successCount = cpUsers.length;

      for (const cpUser of cpUsers) {
        await models.BroadcastTraces.createTrace(
          engageMessage._id,
          'success',
          `Sent in-app notification to client portal user: ${cpUser._id}`,
        );
      }
    } else {
      for (const cpUser of cpUsers) {
        try {
          const result = await sendFirebasePush(
            clientPortal,
            cpUser,
            notificationData.title,
            notificationData.message,
            {
              type: notificationData.type,
              contentTypeId: engageMessage._id,
            },
          );

          if (result.status === 'sent') {
            STATS.successCount++;

            await models.BroadcastTraces.createTrace(
              engageMessage._id,
              'success',
              `Sent push notification to client portal user: ${cpUser._id}`,
            );
          } else {
            STATS.failureCount++;

            await models.BroadcastTraces.createTrace(
              engageMessage._id,
              'regular',
              `Skipped push for client portal user ${cpUser._id}: ${result.status}`,
            );
          }
        } catch (error) {
          STATS.failureCount++;

          await models.BroadcastTraces.createTrace(
            engageMessage._id,
            'failure',
            `Error sending push to client portal user ${cpUser._id}: ${(error as Error).message}`,
          );
        }
      }
    }

    await models.EngageMessages.updateOne(
      { _id: engageMessage._id },
      {
        $inc: {
          validCustomersCount: STATS.successCount,
          'progress.processedBatches': 1,
          'progress.successCount': STATS.successCount,
          'progress.failureCount': STATS.failureCount,
        },
        $set: {
          'progress.lastUpdated': new Date(),
        },
      },
    );

    const message = await models.EngageMessages.findOne({
      _id: engageMessage._id,
    });

    if (message) {
      const totalProcessed = STATS.successCount + STATS.failureCount;
      const failureRate =
        totalProcessed > 0 ? STATS.failureCount / totalProcessed : 0;

      if (message.progress.processedBatches >= message.progress.totalBatches) {
        const finalStatus =
          failureRate >= FAILURE_THRESHOLD ? 'failed' : 'completed';

        await models.EngageMessages.updateOne(
          { _id: engageMessage._id, status: { $eq: 'sending' } },
          { $set: { status: finalStatus } },
        );

        await models.BroadcastTraces.createTrace(
          engageMessage._id,
          finalStatus === 'failed' ? 'failure' : 'success',
          `Campaign ${finalStatus}. Sent: ${STATS.successCount}, Failed: ${STATS.failureCount}`,
        );
      }
    }
  } catch (error) {
    console.error('Critical error in notification processor:', error);

    await models.EngageMessages.updateOne(
      { _id: engageMessage._id },
      {
        $set: { status: 'failed' },
        $inc: {
          'progress.processedBatches': 1,
          'progress.failureCount': cpUsers.length - STATS.successCount,
        },
      },
    );

    await models.BroadcastTraces.createTrace(
      engageMessage._id,
      'failure',
      `Critical error in notification processor: ${(error as Error).message}`,
    );
  }
};
