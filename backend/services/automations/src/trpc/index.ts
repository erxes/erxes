import { t } from './init-trpc';
import { completeDeferredActionProcedure } from './automations/deferred';
import { triggerProcedure } from './automations/trigger';

export const appRouter = t.router({
  automations: t.router({
    trigger: triggerProcedure,
    completeDeferredAction: completeDeferredActionProcedure,
  }),
});

export type AppRouter = typeof appRouter;
