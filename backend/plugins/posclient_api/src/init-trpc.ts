import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

import { IModels } from './connectionResolvers';
import { posclientTrpcRouter } from '~/modules/posclient/trpc/posclient';

export type PosTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<PosTRPCContext>().create();

export const appRouter = t.mergeRouters(posclientTrpcRouter);

export type AppRouter = typeof appRouter;
