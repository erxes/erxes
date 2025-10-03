import { dealTrpcRouter } from '@/sales/trpc/deal';
import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const appRouter = t.mergeRouters(
  dealTrpcRouter
);

export type AppRouter = typeof appRouter;
