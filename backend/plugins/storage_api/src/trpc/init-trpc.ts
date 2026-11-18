import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type StorageTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<StorageTRPCContext>().create();

/** No procedures yet: storage calls accounting, nothing calls storage. */
export const appRouter = t.router({});

export type AppRouter = typeof appRouter;
