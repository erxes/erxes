import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const automationsRouter = t.router({
  automation: t.router({
    find: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ input, ctx }) => {
        const { query } = input;
        const { models } = ctx;
        return await models.Automations.find({
          'triggers.type': query.triggerType,
          'triggers.config.botId': query.botId,
          status: 'active',
          ownedBy: { $exists: false },
        }).lean();
      }),

    // What a source can already say about its own events: which running
    // automations it starts, and what they then do.
    findActive: t.procedure
      .input(
        z.object({
          triggerTypes: z.array(z.string()).min(1),
          actionTypes: z.array(z.string()).optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const { triggerTypes, actionTypes } = input;

        return await ctx.models.Automations.find(
          {
            status: 'active',
            ownedBy: { $exists: false },
            'triggers.type': { $in: triggerTypes },
            ...(actionTypes?.length
              ? { 'actions.type': { $in: actionTypes } }
              : {}),
          },
          { name: 1, triggers: 1, actions: 1 },
        ).lean();
      }),

    count: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ input, ctx }) => {
        const { query } = input;
        const { models } = ctx;
        return await models.Automations.countDocuments(query);
      }),
  }),
  executions: t.router({
    find: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ input, ctx }) => {
        const { ...query } = input;
        const { models } = ctx;
        return await models.AutomationExecutions.find(query);
      }),
  }),
});
