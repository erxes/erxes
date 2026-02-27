import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { afterMutationHandlers } from '../afterMutations';
import { beforeResolverHandlers } from '../beforeResolvers';

export type ProductPlacesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<ProductPlacesTRPCContext>().create();

export const productPlacesTrpcRouter = t.router({
  afterMutation: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { subdomain } = ctx;
    return await afterMutationHandlers(subdomain, input);
  }),

  beforeResolver: t.procedure
    .input(z.any())
    .mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      return await beforeResolverHandlers(models, subdomain, input);
    }),

  afterDealStageChanged: t.procedure
    .input(
      z.object({
        deal: z.any(),
        sourceStageId: z.string().nullable(),
        userId: z.string(), // Pass userId explicitly
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log('🔥 afterDealStageChanged procedure called', input);
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
