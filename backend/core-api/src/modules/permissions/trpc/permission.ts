import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { getEffectiveGrants } from '../grants';
import { resolvePermissionScope } from '../scope';
import { ensurePermissionGroups } from '../utils';

const t = initTRPC.context<CoreTRPCContext>().create();

export const permissionTrpcRouter = t.router({
  permissionGroups: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models, subdomain } = ctx;

      await ensurePermissionGroups(models, subdomain);

      return await models.PermissionGroups.find(query);
    }),
  }),
  permissions: t.router({
    resolveScope: t.procedure
      .input(
        z.object({
          userId: z.string(),
          plugin: z.string(),
          module: z.string(),
          actions: z.array(z.string()).optional(),
        }),
      )
      .query(async ({ ctx, input }) =>
        resolvePermissionScope(ctx.models, input),
      ),
    effectiveGrants: t.procedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ ctx, input }) => {
        await ensurePermissionGroups(ctx.models, ctx.subdomain);

        return getEffectiveGrants(ctx.models, input.userId);
      }),
  }),
});
