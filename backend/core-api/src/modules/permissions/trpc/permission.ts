import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
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
});
