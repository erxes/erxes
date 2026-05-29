import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { FrontlineTRPCContext } from '~/init-trpc';

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const ticketTrpcRouter = t.router({
  ticket: t.router({
    create: t.procedure
      .input(
        z.object({
          doc: z.record(z.any()),
          userId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        return models.Ticket.addTicket(
          input.doc as any,
          input.userId,
          subdomain,
        );
      }),
  }),
});
