import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { getOrganizationId } from './identity';

const t = initTRPC.context<CoreTRPCContext>().create();

export const organizationTrpcRouter = t.router({
  organization: t.router({
    /** `{ organizationId, subdomain }` of the calling request's subdomain. */
    identity: t.procedure.query(async ({ ctx }) => ({
      organizationId: await getOrganizationId(ctx.models, ctx.subdomain),
      subdomain: ctx.subdomain,
    })),
  }),
});
