import { initTRPC } from '@trpc/server';
import { graphqlPubsub, ITRPCContext } from 'erxes-api-shared/utils';
import { Types } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { z } from 'zod';

export type TaskTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<TaskTRPCContext>().create();

export const taskTrpcRouter = t.router({
  task: t.router({
    tag: t.procedure
      .input(
        z.object({
          tagIds: z.array(z.string()),
          targetIds: z.array(z.string()),
          type: z.string(),
          action: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { tagIds, targetIds } = input;

        await models.Task.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } },
        );

        return models.Task.find({ _id: { $in: targetIds } }).lean();
      }),

    findOne: t.procedure
      .input(z.object({ _ids: z.array(z.string()) }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const ids = input._ids.filter((id) => Types.ObjectId.isValid(id));

        if (!ids.length) {
          return null;
        }

        return models.Task.findOne(
          { _id: { $in: ids } },
          { _id: 1, name: 1, teamId: 1 },
        ).lean();
      }),

    createFromSource: t.procedure
      .input(
        z.object({
          userId: z.string(),
          doc: z.object({
            name: z.string().min(1),
            status: z.string().min(1),
            description: z.string().optional(),
            priority: z.number().int().min(0).max(4).optional(),
            assigneeId: z.string().optional(),
            labelIds: z.array(z.string()).optional(),
            tagIds: z.array(z.string()).optional(),
            startDate: z.coerce.date().optional(),
            targetDate: z.coerce.date().optional(),
            propertiesData: z.record(z.unknown()).optional(),
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { userId, doc } = input;

        if (!Types.ObjectId.isValid(doc.status)) {
          throw new Error('Status not found');
        }

        const status = await models.Status.getStatus(doc.status);

        const task = await models.Task.createTask({
          doc: { ...doc, teamId: String(status.teamId) },
          userId,
          subdomain,
        });

        await graphqlPubsub.publish(`operationTaskChanged:${task._id}`, {
          operationTaskChanged: { type: 'create', task },
        });

        await graphqlPubsub.publish('operationTaskListChanged', {
          operationTaskListChanged: { type: 'create', task },
        });

        return { _id: String(task._id) };
      }),
  }),
});
