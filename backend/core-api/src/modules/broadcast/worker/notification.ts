import { IBroadcastRunDocument } from '@/broadcast/db/models/BroadcastRuns';
import {
  createNotificationsBulk,
  notificationService,
} from '@/clientportal/services/notification';
import { firebaseService } from '@/clientportal/services/notification/firebaseService';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { drainRun, TDrainDeliver } from './drain';

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

const buildNotificationData = (run: IBroadcastRunDocument) => ({
  title: run.notification?.title || '',
  message: run.notification?.content || '',
  type: 'info' as const,
  contentType: 'core:broadcast',
  contentTypeId: run.engageMessageId,
  kind: 'system' as const,
  allowMultiple: true,
});

const deliverNotifications: TDrainDeliver = async ({
  models,
  subdomain,
  run,
  recipients,
}) => {
  const clientPortal = run.cpId
    ? await models.ClientPortal.findOne({ _id: run.cpId }).lean()
    : null;

  if (!clientPortal) {
    for (const recipient of recipients) {
      await models.BroadcastRecipients.finish(
        recipient._id,
        'failed',
        'client portal not found',
      );
    }

    return;
  }

  // The manifest is a list of customers; a notification needs the portal user
  // they signed in as, which is looked up now rather than frozen at enrolment
  // so somebody who registered since is still reachable.
  const cpUsers = await models.CPUser.find({
    clientPortalId: clientPortal._id,
    erxesCustomerId: {
      $in: recipients.map(({ customerId }) => customerId),
    },
  }).lean();

  const byCustomer = new Map(
    cpUsers.map((cpUser) => [cpUser.erxesCustomerId, cpUser]),
  );

  const reachable: { recipientId: string; cpUser: ICPUserDocument }[] = [];

  for (const recipient of recipients) {
    const cpUser = byCustomer.get(recipient.customerId);

    if (!cpUser) {
      await models.BroadcastRecipients.finish(
        recipient._id,
        'skipped',
        'no linked client portal user',
      );
      continue;
    }

    reachable.push({ recipientId: recipient._id, cpUser });
  }

  if (!reachable.length) {
    return;
  }

  const inApp = run.notification?.inApp !== false;
  const isMobile = run.notification?.isMobile === true;
  const notificationData = buildNotificationData(run);

  if (!inApp && !isMobile) {
    for (const { recipientId } of reachable) {
      await models.BroadcastRecipients.finish(
        recipientId,
        'skipped',
        'no notification channels enabled',
      );
    }

    return;
  }

  const targets = reachable.map(({ cpUser }) => cpUser);

  if (inApp && isMobile) {
    await notificationService.sendNotificationBulk(
      subdomain,
      models,
      clientPortal,
      targets,
      notificationData,
    );

    for (const { recipientId } of reachable) {
      await models.BroadcastRecipients.finish(recipientId, 'sent');
    }

    return;
  }

  if (inApp) {
    await createNotificationsBulk(subdomain, models, {
      clientPortalId: clientPortal._id,
      cpUserIds: targets.map((cpUser) => cpUser._id),
      ...notificationData,
    });

    for (const { recipientId } of reachable) {
      await models.BroadcastRecipients.finish(recipientId, 'sent');
    }

    return;
  }

  for (const { recipientId, cpUser } of reachable) {
    try {
      const result = await sendFirebasePush(
        clientPortal,
        cpUser,
        notificationData.title,
        notificationData.message,
        {
          type: notificationData.type,
          contentTypeId: run.engageMessageId,
        },
      );

      if (result.status === 'sent') {
        await models.BroadcastRecipients.finish(recipientId, 'sent');
      } else {
        await models.BroadcastRecipients.finish(
          recipientId,
          'skipped',
          result.status === 'no_tokens'
            ? 'no device registered'
            : 'push is not configured',
        );
      }
    } catch (error: any) {
      await models.BroadcastRecipients.finish(
        recipientId,
        'failed',
        error.message,
      );
    }
  }
};

export const handleNotificationProcessor = async (payload: unknown) =>
  drainRun(payload, deliverNotifications);
