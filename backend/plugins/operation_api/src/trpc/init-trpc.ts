import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { taskTrpcRouter } from '~/modules/task/trpc/task';

export type OperationTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<OperationTRPCContext>().create();



export const appRouter = t.mergeRouters(
  t.router({
    operation: {
      hello: t.procedure.query(() => {
        return 'Hello operation';
      }),
    },
  }),
  taskTrpcRouter,
);

export type AppRouter = typeof appRouter;
