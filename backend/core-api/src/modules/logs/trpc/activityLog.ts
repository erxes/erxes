import { initTRPC, TRPCError } from '@trpc/server';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const activityLogRouter = t.router({
  activityLog: t.router({
    createActivityLog: t.procedure
      .input(
        z.array(
          z.object({
            activityType: z.string(),
            target: z.any(),
            context: z.any().optional(),
            action: z.object({
              type: z.string(),
              description: z.string(),
            }),
            changes: z.any(),
            metadata: z.any().optional(),
            pluginName: z.string(),
            moduleName: z.string(),
            collectionName: z.string(),
          }),
        ),
      )
      .mutation(async ({ input, ctx }) => {
        const { models, userId, subdomain } = ctx;
        if (!userId) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const activities = Array.isArray(input) ? input : [input];

        const user = await models.Users.findOne(
          { _id: userId },
          {
            email: 1,
            username: 1,
            detail: 1,
            isOwner: 1,
            isActive: 1,
            role: 1,
            code: 1,
            branchIds: 1,
            departmentIds: 1,
            customFieldsData: 1,
          },
        );

        for (const {
          activityType,
          target,
          context,
          action,
          changes,
          metadata,
          pluginName,
          moduleName,
          collectionName,
        } of activities) {
          const targetId = target?._id;
          const targetType = `${pluginName}:${moduleName}.${collectionName}`;

          const activityLog = await models.ActivityLogs.create({
            activityType,
            targetId,
            targetType,
            target,
            context,
            action,
            changes,
            metadata,
            actorType: user?.role || 'user',
            actor: user,
          });

          // Publish subscription for activity log insertion
          if (targetId) {
            graphqlPubsub.publish(
              `activityLogInserted:${subdomain}:${targetId}`,
              {
                activityLogInserted: activityLog.toObject(),
              },
            );
          }
        }

        return 'success';
      }),
    deleteActivityLog: t.procedure
      .input(z.object({ targetIds: z.array(z.string()) }))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { targetIds } = input;
        await models.ActivityLogs.deleteMany({ targetId: { $in: targetIds } });
        return 'success'
      })
  }),
});
