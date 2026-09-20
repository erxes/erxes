import { t } from './init-trpc';
import { completeDeferredActionProcedure } from './automations/deferred';
import { resumeWaitingExecutionsProcedure } from './automations/resumeWaiting';
import { runForTargetProcedure } from './automations/runForTarget';
import { triggerProcedure } from './automations/trigger';

export const appRouter = t.router({
  automations: t.router({
    trigger: triggerProcedure,
    runForTarget: runForTargetProcedure,
    completeDeferredAction: completeDeferredActionProcedure,
    resumeWaitingExecutions: resumeWaitingExecutionsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
