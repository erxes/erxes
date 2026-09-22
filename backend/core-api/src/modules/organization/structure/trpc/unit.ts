import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

export const unitTrpcRouter = t.router({
  units: t.router({
    find: t.procedure
      .meta(
        agentMeta(
          'List units (cross-department organizational groupings): { query?, fields? }. Use to resolve a unit name/code to its _id.',
          { module: 'organization', action: 'organizationRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, fields } = input;

      return await models.Units.find(query, fields).lean();
    }),

    findOne: t.procedure
      .meta(
        agentMeta(
          'Get a single unit by { _id }, { code }, or any MongoDB-style query. Returns {} when nothing matches.',
          { module: 'organization', action: 'organizationRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return await models.Units.findOne(query).lean();
    }),
  }),
});
