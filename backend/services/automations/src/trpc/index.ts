import { t } from './init-trpc';
import { automationsTriggerTrpcRouter } from './automations/trigger';

export const appRouter = t.mergeRouters(automationsTriggerTrpcRouter);

export type AppRouter = typeof appRouter;
