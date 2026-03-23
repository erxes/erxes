import { initTRPC } from '@trpc/server';
import { AccountingTRPCContext } from '~/init-trpc';

const t = initTRPC.context<AccountingTRPCContext>().create();

export const remainderTrpcRouter = t.router({
});
