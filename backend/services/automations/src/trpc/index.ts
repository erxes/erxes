import { t } from '@/trpc/init-trpc';
import { automationsTriggerTrpcRouter } from '@/trpc/automations/trigger';

export const appRouter = t.mergeRouters(automationsTriggerTrpcRouter);

export type AppRouter = typeof appRouter;
