import { initTRPC } from '@trpc/server';
import { buildPropertyFilter } from 'erxes-api-shared/core-modules';
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
    matchesProperties: t.procedure
      .input(
        z.object({
          ticketId: z.string(),
          propertiesData: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const conditions = buildPropertyFilter(input.propertiesData);

        if (!conditions.length) {
          return true;
        }

        const matched = await ctx.models.Ticket.exists({
          _id: input.ticketId,
          $and: conditions,
        });

        return !!matched;
      }),
  }),
});
