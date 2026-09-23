import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { afterMutationHandlers } from '../afterMutations';
import { beforeResolverHandlers } from '../beforeResolvers';

export type ProductPlacesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ProductPlacesTRPCContext>().create();

const beforeResolverInput = z.object({
  resolver: z.string(),
  args: z.record(z.unknown()).optional(),
  user: z.unknown().optional(),
  headers: z.record(z.unknown()).optional(),
});

const afterMutationInput = z.object({
  type: z.string(),
  action: z.string(),
  updatedDocument: z.unknown().optional(),
  object: z.unknown().optional(),
  user: z.unknown().optional(),
});

export const productPlacesTrpcRouter = t.router({
  afterMutation: t.procedure
    .input(afterMutationInput)
    .mutation(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      return await afterMutationHandlers(subdomain, input);
    }),

  beforeResolver: t.procedure
    .input(beforeResolverInput)
    .mutation(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      return await beforeResolverHandlers(subdomain, input);
    }),

  afterDealStageChanged: t.procedure
    .input(
      z.object({
        deal: z.unknown(),
        sourceStageId: z.string().nullable(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { deal, sourceStageId, userId } = input;
      const { subdomain } = ctx;

      await afterMutationHandlers(subdomain, {
        type: 'sales:deal',
        action: 'update',
        updatedDocument: deal,
        object: { stageId: sourceStageId },
        user: userId,
      });

      return { success: true };
    }),
});
