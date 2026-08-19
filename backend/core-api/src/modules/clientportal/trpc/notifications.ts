import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { notificationService } from '@/clientportal/services';

const t = initTRPC.context<CoreTRPCContext>().create();

const notificationDataSchema = z.object({
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
});

export const cpNotificationTrpcRouter = t.router({
  cpNotifications: t.router({
    create: t.procedure
      .meta({
        agent: {
          description:
            'Send a notification to client portal users (in-app in the customer portal). Input: { cpUserIds: [...], clientPortalId, data: { title, message, type?, priority?, contentType?, contentTypeId?, action? } } — type: "info"|"success"|"warning"|"error", priority: "low"|"medium"|"high"|"urgent". Workflow: customers.findOne → cpUsers.list (erxesCustomerId) to get cpUserIds → this tool. Use to notify end customers about updates to their tickets, orders, etc.',
          permission: { module: 'clientPortal', action: 'clientPortalManage' },
        },
      })
      .input(
        z.object({
          cpUserIds: z.array(z.string()),
          clientPortalId: z.string(),
          eventType: z.string().optional(),
          data: notificationDataSchema,
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

        const cpUsers = await models.CPUser.find({
          _id: { $in: cpUserIds },
        });

        if (cpUsers.length === 0) {
          return { success: true, count: 0 };
        }

        await notificationService.sendNotificationBulk(
          subdomain,
          models,
          clientPortal,
          cpUsers,
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

        return { success: true, count: cpUsers.length };
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
      .meta({
        agent: {
          description:
            'List notifications previously sent to a portal user: { cpUserId, clientPortalId?, isRead?, limit?, skip? }. Returns { list, totalCount }. Get cpUserId from cpUsers.list.',
          permission: { module: 'clientPortal', action: 'clientPortalRead' },
        },
      })
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

        const query: Record<string, unknown> = { cpUserId };
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
