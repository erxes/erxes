import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { loyaltyTrpcRouter } from '~/modules/loyalty/trpc/loyalty';

export type LoyaltyTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<LoyaltyTRPCContext>().create();

export const appRouter = t.mergeRouters(loyaltyTrpcRouter);

export type AppRouter = typeof appRouter;
