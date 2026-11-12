import { oc } from '@orpc/contract';
import { z } from 'zod';
import { AutomationDefinition } from './automationDefinition';
import { ActionInfo, AutomationRun, RunStatus, RunStep } from './automationRuns';
import { CursorQuery, cursorPageOf, Id } from './common';

export const AutomationStatus = z.enum(['draft', 'active', 'paused']);

export const Automation = z.object({
  id: Id,
  name: z.string(),
  description: z.string().nullable(),
  status: AutomationStatus,
  definition: AutomationDefinition,
  /** The version runs start with (null until first activated). */
  activeVersion: z.number().int().nullable(),
  activatedBy: z.string().nullable(),
  stats: z.object({
    running: z.number().int(),
    succeeded: z.number().int(),
    failed: z.number().int(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Automation = z.infer<typeof Automation>;

const Fields = {
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  definition: AutomationDefinition,
};

/**
 * Automations: when an event happens (and its conditions hold), run steps —
 * actions from core and plugins, delays and branches — for its customer or
 * company. Every run and step is logged.
 */
export const automationsContract = {
  catalog: oc
    .route({
      method: 'GET',
      path: '/automations/catalog',
      summary: "Triggers (event types) and actions: core's and installed plugins'",
    })
    .output(
      z.object({
        triggers: z.array(
          z.object({
            type: z.string(),
            label: z.string(),
            /** A line on what it is, for pickers. */
            description: z.string().nullable().optional(),
            source: z.string(),
            subject: z.enum(['customer', 'company']).nullable(),
          }),
        ),
        actions: z.array(ActionInfo),
      }),
    ),
  list: oc
    .route({ method: 'GET', path: '/automations' })
    .input(z.object({ status: AutomationStatus.optional() }))
    .output(z.object({ data: z.array(Automation) })),
  get: oc
    .route({ method: 'GET', path: '/automations/{id}' })
    .input(z.object({ id: Id }))
    .output(Automation),
  create: oc
    .route({ method: 'POST', path: '/automations', successStatus: 201 })
    .input(z.object(Fields))
    .output(Automation),
  update: oc
    .route({
      method: 'PATCH',
      path: '/automations/{id}',
      summary:
        'Change an automation; an active one publishes a new version (runs in progress keep theirs)',
    })
    .input(
      z.object({
        id: Id,
        name: Fields.name.optional(),
        description: Fields.description,
        definition: Fields.definition.optional(),
      }),
    )
    .output(Automation),
  activate: oc
    .route({
      method: 'POST',
      path: '/automations/{id}/activate',
      summary: 'Check and turn on (as the member, whose permissions its actions use)',
    })
    .input(z.object({ id: Id }))
    .output(Automation),
  pause: oc
    .route({ method: 'POST', path: '/automations/{id}/pause' })
    .input(z.object({ id: Id }))
    .output(Automation),
  start: oc
    .route({
      method: 'POST',
      path: '/automations/{id}/start',
      summary: 'Run a manual (or any) automation now: on the given records, or on its audience',
    })
    .input(z.object({ id: Id, subjects: z.array(Id).max(1000).optional() }))
    .output(z.object({ started: z.number().int(), skipped: z.number().int() })),
  test: oc
    .route({
      method: 'POST',
      path: '/automations/{id}/test',
      summary:
        'Dry run of the working copy: what each step would do for a record (nothing is changed)',
    })
    .input(
      z.object({
        id: Id,
        subject: z.object({ type: z.enum(['customer', 'company']), id: Id }).optional(),
        /** Event fields for the trigger (type, payload); defaults to the trigger's event. */
        payload: z.record(z.unknown()).optional(),
        /** Pretend waits for events end with the event happening. */
        assumeEventHappens: z.boolean().default(false),
      }),
    )
    .output(
      z.object({
        triggerMatches: z.boolean(),
        goalMetAtStart: z.boolean(),
        trace: z.array(
          z.object({
            stepId: z.string(),
            type: z.string(),
            outcome: z.string(),
            input: z.unknown().nullable(),
            problem: z.string().nullable(),
          }),
        ),
      }),
    ),
  stats: oc
    .route({
      method: 'GET',
      path: '/automations/{id}/stats',
      summary: 'How runs went, overall and step by step (last 30 days)',
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        runs: z.object({
          total: z.number().int(),
          running: z.number().int(),
          succeeded: z.number().int(),
          failed: z.number().int(),
          cancelled: z.number().int(),
          goalReached: z.number().int(),
        }),
        steps: z.array(
          z.object({
            stepId: z.string(),
            succeeded: z.number().int(),
            failed: z.number().int(),
            skipped: z.number().int(),
          }),
        ),
        skippedByLimit: z.number().int(),
      }),
    ),
  versions: oc
    .route({
      method: 'GET',
      path: '/automations/{id}/versions',
      summary: 'Published versions, newest first',
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        data: z.array(
          z.object({
            version: z.number().int(),
            publishedBy: z.string().nullable(),
            createdAt: z.string().datetime(),
            definition: AutomationDefinition,
          }),
        ),
      }),
    ),
  restoreVersion: oc
    .route({
      method: 'POST',
      path: '/automations/{id}/versions/{version}/restore',
      summary: 'Make an older version the working copy (and publish it if the automation is on)',
    })
    .input(z.object({ id: Id, version: z.coerce.number().int().min(1) }))
    .output(Automation),
  templates: oc
    .route({
      method: 'GET',
      path: '/automations/templates',
      summary: 'Ready-made automations to start from',
    })
    .output(
      z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            definition: AutomationDefinition,
          }),
        ),
      }),
    ),
  fields: oc
    .route({
      method: 'GET',
      path: '/automations/fields',
      summary:
        'Paths conditions and placeholders can use, with their types (custom fields included)',
    })
    .input(z.object({ subject: z.enum(['customer', 'company']).optional() }))
    .output(
      z.object({
        data: z.array(
          z.object({
            path: z.string(),
            label: z.string(),
            type: z.enum(['text', 'number', 'date', 'boolean', 'list', 'member', 'tags', 'select']),
            options: z.array(z.string()).optional(),
          }),
        ),
      }),
    ),
  remove: oc
    .route({ method: 'DELETE', path: '/automations/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  runs: oc
    .route({ method: 'GET', path: '/automations/{id}/runs' })
    .input(CursorQuery.extend({ id: Id, status: RunStatus.optional() }))
    .output(cursorPageOf(AutomationRun)),
  run: oc
    .route({ method: 'GET', path: '/automations/runs/{runId}' })
    .input(z.object({ runId: Id }))
    .output(z.object({ run: AutomationRun, steps: z.array(RunStep) })),
  retryRun: oc
    .route({
      method: 'POST',
      path: '/automations/runs/{runId}/retry',
      summary: 'Continue a failed run from the step that failed',
    })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
  cancelRun: oc
    .route({
      method: 'POST',
      path: '/automations/runs/{runId}/cancel',
      summary: 'Stop a running or waiting run',
    })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
};
