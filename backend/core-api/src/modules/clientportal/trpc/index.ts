import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { notificationService } from '../services/notificationService';

const t = initTRPC.context<CoreTRPCContext>().create();

export const clientPortalNotificationTrpcRouter = t.router({
  cpNotifications: t.router({
    create: t.procedure
      .input(
        z.object({
          cpUserIds: z.array(z.string()),
          clientPortalId: z.string(),
          eventType: z.string().optional(),
          data: z.object({
            title: z.string(),
            message: z.string(),
            type: z.enum(['info', 'success', 'warning', 'error']).optional(),
            contentType: z.string().optional(),
            contentTypeId: z.string().optional(),
            priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
            metadata: z.any().optional(),
            action: z.string().optional(),
            kind: z.enum(['system', 'user']).optional(),
            allowMultiple: z.boolean().optional(),
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { cpUserIds, clientPortalId, data } = input;
        const { models, subdomain } = ctx;

        const clientPortal = await models.ClientPortal.findOne({
          _id: clientPortalId,
        });

        if (!clientPortal) {
          throw new Error('Client portal not found');
        }

        const results: unknown[] = [];

        for (const cpUserId of cpUserIds) {
          const cpUser = await models.CPUser.findOne({ _id: cpUserId });

          if (!cpUser) {
            continue;
          }

          const notification = await notificationService.sendNotification(
            subdomain,
            models,
            clientPortal,
            cpUser,
            {
              title: data.title,
              message: data.message,
              type: data.type,
              contentType: data.contentType,
              contentTypeId: data.contentTypeId,
              priority: data.priority,
              metadata: data.metadata,
              action: data.action,
              kind: data.kind,
              allowMultiple: data.allowMultiple,
            },
          );

          results.push(notification);
        }

        return { success: true, count: results.length };
      }),

    markAsRead: t.procedure
      .input(
        z.object({
          notificationId: z.string(),
          cpUserId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { notificationId, cpUserId } = input;
        const { models } = ctx;

        const notification = await models.CPNotifications.findOneAndUpdate(
          { _id: notificationId, cpUserId },
          { $set: { isRead: true, readAt: new Date() } },
          { new: true },
        );

        if (!notification) {
          throw new Error('Notification not found');
        }

        return { success: true };
      }),

    list: t.procedure
      .input(
        z.object({
          cpUserId: z.string(),
          clientPortalId: z.string().optional(),
          isRead: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(20),
          skip: z.number().min(0).default(0),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { cpUserId, clientPortalId, isRead, limit, skip } = input;
        const { models } = ctx;

        const query: any = { cpUserId };
        if (clientPortalId) {
          query.clientPortalId = clientPortalId;
        }
        if (isRead !== undefined) {
          query.isRead = isRead;
        }

        const notifications = await models.CPNotifications.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .lean();

        const totalCount = await models.CPNotifications.countDocuments(query);

        return {
          list: notifications,
          totalCount,
        };
      }),
  }),
});
