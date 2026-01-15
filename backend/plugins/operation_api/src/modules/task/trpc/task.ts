import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
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
  }),
});
