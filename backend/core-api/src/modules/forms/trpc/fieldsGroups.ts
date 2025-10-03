import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const fieldsGroupsTrpcRouter = t.router({
  fieldsGroups: t.router({
    find: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return await models.FieldsGroups.find(query).lean();
      }),
    updateGroup: t.procedure
      .input(z.object({ groupId: z.string(), fieldGroup: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { groupId, fieldGroup } = input;
        const { models } = ctx;
        return await models.FieldsGroups.updateGroup(groupId, fieldGroup);
      }),
  }),
});
