import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

export const fieldsGroupsTrpcRouter = t.router({
  fieldsGroups: t.router({
    find: t.procedure
      .meta(
        agentMeta(
          'List custom field groups (sections that custom fields belong to): { query? }. Use with fields.find to understand how custom fields are organized.',
          { module: 'properties', action: 'propertiesRead' },
        ),
      )
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return await models.FieldsGroups.find(query).lean();
      }),
  }),
});
