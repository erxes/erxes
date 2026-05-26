import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type BranchedTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<BranchedTRPCContext>().create();

export const appRouter = t.router({});

export type AppRouter = typeof appRouter;
