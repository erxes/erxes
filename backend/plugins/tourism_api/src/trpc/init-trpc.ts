import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

import { IModels } from '~/connectionResolvers';

import { branchRouter } from '~/modules/bms/trpc';

export type TourismTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<TourismTRPCContext>().create();

export const appRouter = t.mergeRouters(branchRouter);

export type AppRouter = typeof appRouter;
