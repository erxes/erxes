import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { PosTRPCContext } from '~/init-trpc';

const t = initTRPC.context<PosTRPCContext>().create();

export const inboxTrpcRouter = t.router({
  inbox: t.router({
    getConversations: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
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
