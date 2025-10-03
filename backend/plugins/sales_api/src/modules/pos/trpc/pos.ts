import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
// import { PosTRPCContext } from '~/init-trpc';
import { IModels } from '~/connectionResolvers';
// const t = initTRPC.context<PosTRPCContext>().create();
export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const posTrpcRouter = t.router({
  pos: t.router({
    confirm: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Pos.find(query).lean();
    }),
    // removeCustomersConversations: t.procedure
    //   .input(z.any())
    //   .mutation(async ({ ctx, input }) => {
    //     const { customerIds } = input;
    //     const { models } = ctx;

    //     return await models.Pos.removeCustomersConversations(
    //       customerIds,
    //     );
    //   }),
    // changeCustomer: t.procedure
    //   .input(z.any())
    //   .mutation(async ({ ctx, input }) => {
    //     const { customerId, customerIds } = input;
    //     const { models } = ctx;

    //     return await models.Pos.changeCustomer(
    //       customerId,
    //       customerIds,
    //     );
    //   }),
  }),
});
