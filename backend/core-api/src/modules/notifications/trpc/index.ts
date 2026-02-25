import { initTRPC } from '@trpc/server';
import { INotificationDocument } from 'erxes-api-shared/core-modules';
import { getEnv, graphqlPubsub } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { PRIORITY_ORDER } from '~/modules/notifications/constants';
import { sendEmail } from '~/utils/email';

const t = initTRPC.context<CoreTRPCContext>().create();

export const notificationTrpcRouter = t.router({
  notifications: t.router({
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { userIds = [], data } = input;
      const { models, subdomain } = ctx;

      const { kind, allowMultiple, contentType, contentTypeId, priority } =
        data || {};

      for (const userId of userIds) {
        let notification: INotificationDocument | null = null;

        const notificationDoc = {
          ...data,
          userId,
          isRead: false,
          priorityLevel: PRIORITY_ORDER[priority || 'medium'],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        if (kind === 'user' && !allowMultiple) {
          // avoiding duplicate notifications for the same user and content.
          // Update existing notification
          notification = await models.Notifications.findOneAndUpdate(
            { contentTypeId, contentType, userId }, // lookup key
            notificationDoc, // new values
            { new: true, upsert: true }, // update if exists, insert if not
          );
        }

        if (!notification) {
          // Create new notification
          notification = await models.Notifications.create(notificationDoc);
        }

        if (notification) {
          // Publish the notification event
          graphqlPubsub.publish(`notificationInserted:${subdomain}:${userId}`, {
            notificationInserted: { ...notification.toObject() },
          });
        }
      }

      return models.Notifications.find({ userId: { $in: userIds } }).lean();
    }),

    sendEmail: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { subdomain, models } = ctx;

      const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

      // for unsubscribe url
      const modifier = async (data: any, email: string) => {
        const user = await models.Users.findOne({ email }).lean();

        if (!user) {
          return;
        }

        data.uid = user._id;

        const userNotification = await models.Notifications.findOne({
          userId: user._id,
        }).lean();

        if (userNotification && data.notification) {
          data.notification.link = `${DOMAIN}/my-inbox/${userNotification._id}`;
        }
      };

      await sendEmail(subdomain, { ...input, modifier }, models);
    }),

    settings: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { userIds } = input;

      return models.NotificationSettings.find({ userId: { $in: userIds } });
    }),
  }),
});
