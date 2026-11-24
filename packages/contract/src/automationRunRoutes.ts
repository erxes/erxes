import { z } from 'zod';
import { automationBase as base } from './automationBase';
import { AutomationRun, DataField, RunStatus, RunStep } from './automationRuns';
import { CursorQuery, cursorPageOf, Id } from './common';

export const automationRunRoutes = {
  outputs: base
    .route({
      method: 'GET',
      path: '/automations/{id}/outputs',
      summary: 'Get what its steps returned',
      description:
        "The keys each action step has answered with in its runs (a sheet row's columns)",
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        data: z
          .array(
            z.object({
              stepId: z.string(),
              action: z.string(),
              fields: z.array(DataField).max(50),
            }),
          )
          .max(500),
      }),
    ),
  stats: base
    .route({
      method: 'GET',
      path: '/automations/{id}/stats',
      summary: 'Get automation run stats',
      description: 'How runs went, overall and step by step (last 30 days)',
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        runs: z.object({
          total: z.int(),
          running: z.int(),
          succeeded: z.int(),
          failed: z.int(),
          cancelled: z.int(),
          goalReached: z.int(),
        }),
        steps: z.array(
          z.object({
            stepId: z.string(),
            succeeded: z.int(),
            failed: z.int(),
            skipped: z.int(),
          }),
        ),
        skippedByLimit: z.int(),
      }),
    ),
  runs: base
    .route({ method: 'GET', path: '/automations/{id}/runs', summary: 'List automation runs' })
    .input(CursorQuery.extend({ id: Id, status: RunStatus.optional() }))
    .output(cursorPageOf(AutomationRun)),
  run: base
    .route({ method: 'GET', path: '/automations/runs/{runId}', summary: 'Get an automation run' })
    .input(z.object({ runId: Id }))
    .output(z.object({ run: AutomationRun, steps: z.array(RunStep) })),
  retryRun: base
    .route({
      method: 'POST',
      path: '/automations/runs/{runId}/retry',
      summary: 'Retry a failed run',
      description: 'Continue a failed run from the step that failed',
    })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
  cancelRun: base
    .route({
      method: 'POST',
      path: '/automations/runs/{runId}/cancel',
      summary: 'Cancel a run',
      description: 'Stop a running or waiting run',
    })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
};
