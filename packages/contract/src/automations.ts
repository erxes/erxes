import { AUTOMATION_FIELD_TYPES, CONTENT_TYPES } from '@erxes/core-db/enums';
import { automations } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { AutomationStatus } from './values';
import { AutomationDefinition } from '@erxes/core-db/automationDefinition';
import { ActionInfo, AutomationRun, RunStatus, RunStep } from './automationRuns';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf } from './common';

export const Automation = createSelectSchema(automations, {
  id: Id,
  definition: AutomationDefinition,
  activeVersion: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    name: true,
    description: true,
    status: true,
    definition: true,
    /** The version runs start with (null until first activated). */
    activeVersion: true,
    activatedBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    stats: z.object({
      running: z.int(),
      succeeded: z.int(),
      failed: z.int(),
    }),
  });

export type Automation = z.infer<typeof Automation>;

/** A path conditions and placeholders can read, with how its values compare. */
export const AutomationFieldPath = z.object({
  path: z.string(),
  label: z.string(),
  type: z.enum(AUTOMATION_FIELD_TYPES),
  options: z.array(z.string()).optional(),
});

export type AutomationFieldPath = z.infer<typeof AutomationFieldPath>;

/** One step of a dry run: what it would do, and what would stop it. */
export const DryRunStep = z.object({
  stepId: z.string(),
  type: z.string(),
  outcome: z.string(),
  input: z.unknown().nullable(),
  problem: z.string().nullable(),
});

export type DryRunStep = z.infer<typeof DryRunStep>;

const Fields = createUpdateSchema(automations, {
  name: (name) => name.trim().min(1).max(120),
  description: (value) => value.trim().max(500),
  definition: AutomationDefinition.optional(),
}).pick({ name: true, description: true, definition: true });

/**
 * Automations: when an event happens (and its conditions hold), run steps —
 * actions from core and plugins, delays and branches — for its customer or
 * company. Every run and step is logged.
 */
const {
  CROSS_SITE,
  INVALID_AUTOMATION,
  INVALID_FILE,
  INVALID_LEAD_STAGE,
  INVALID_RECIPIENT,
  INVALID_STEP_INPUT,
  INVALID_URL,
  LIMIT_EXCEEDED,
  NOT_ACTIVE,
  NOT_AUTHOR,
  NOT_FAILED,
  NOT_RUNNING,
  NO_MEMBERS,
  NO_SUBJECT,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  CROSS_SITE,
  INVALID_AUTOMATION,
  INVALID_FILE,
  INVALID_LEAD_STAGE,
  INVALID_RECIPIENT,
  INVALID_STEP_INPUT,
  INVALID_URL,
  LIMIT_EXCEEDED,
  NOT_ACTIVE,
  NOT_AUTHOR,
  NOT_FAILED,
  NOT_RUNNING,
  NO_MEMBERS,
  NO_SUBJECT,
});

export const automationsContract = {
  catalog: base
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
            subject: z.enum(CONTENT_TYPES).nullable(),
          }),
        ),
        actions: z.array(ActionInfo),
      }),
    ),
  list: base
    .route({ method: 'GET', path: '/automations' })
    .input(z.object({ status: AutomationStatus.optional() }))
    .output(listOf(Automation)),
  get: base
    .route({ method: 'GET', path: '/automations/{id}' })
    .input(z.object({ id: Id }))
    .output(Automation),
  create: base
    .route({ method: 'POST', path: '/automations', successStatus: 201 })
    .input(Fields.required({ name: true, definition: true }))
    .output(Automation),
  update: base
    .route({
      method: 'PATCH',
      path: '/automations/{id}',
      summary:
        'Change an automation; an active one publishes a new version (runs in progress keep theirs)',
    })
    .input(Fields.extend({ id: Id }))
    .output(Automation),
  activate: base
    .route({
      method: 'POST',
      path: '/automations/{id}/activate',
      summary: 'Check and turn on (as the member, whose permissions its actions use)',
    })
    .input(z.object({ id: Id }))
    .output(Automation),
  pause: base
    .route({ method: 'POST', path: '/automations/{id}/pause' })
    .input(z.object({ id: Id }))
    .output(Automation),
  start: base
    .route({
      method: 'POST',
      path: '/automations/{id}/start',
      summary: 'Run a manual (or any) automation now: on the given records, or on its audience',
    })
    .input(z.object({ id: Id, subjects: z.array(Id).max(1000).optional() }))
    .output(
      z.object({
        started: z.int(),
        skipped: z.int(),
        /** The audience is larger than one page: the rest starts in the background. */
        continuing: z.boolean(),
      }),
    ),
  test: base
    .route({
      method: 'POST',
      path: '/automations/{id}/test',
      summary:
        'Dry run of the working copy: what each step would do for a record (nothing is changed)',
    })
    .input(
      z
        .object({
          id: Id,
          /** The record to run for: send both, or neither for a run without one. */
          subjectType: z.enum(CONTENT_TYPES).optional(),
          subjectId: Id.optional(),
          /** Event fields for the trigger (type, payload); defaults to the trigger's event. */
          payload: z.record(z.string(), z.unknown()).optional(),
          /** Pretend waits for events end with the event happening. */
          assumeEventHappens: z.boolean().default(false),
        })
        .refine((input) => !input.subjectType === !input.subjectId, {
          message: 'Send subjectType and subjectId together',
          path: ['subjectId'],
        }),
    )
    .output(
      z.object({
        triggerMatches: z.boolean(),
        goalMetAtStart: z.boolean(),
        trace: z.array(DryRunStep),
      }),
    ),
  stats: base
    .route({
      method: 'GET',
      path: '/automations/{id}/stats',
      summary: 'How runs went, overall and step by step (last 30 days)',
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
  versions: base
    .route({
      method: 'GET',
      path: '/automations/{id}/versions',
      summary: 'The 100 latest published versions, newest first',
    })
    .input(z.object({ id: Id }))
    .output(
      z.object({
        data: z
          .array(
            z.object({
              version: z.int(),
              publishedBy: z.string().nullable(),
              createdAt: isoDate(),
              definition: AutomationDefinition,
            }),
          )
          .max(100),
      }),
    ),
  restoreVersion: base
    .route({
      method: 'POST',
      path: '/automations/{id}/versions/{version}/restore',
      summary: 'Make an older version the working copy (and publish it if the automation is on)',
    })
    .input(z.object({ id: Id, version: z.coerce.number().int().min(1) }))
    .output(Automation),
  templates: base
    .route({
      method: 'GET',
      path: '/automations/templates',
      summary: 'Ready-made automations to start from',
    })
    .output(
      listOf(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          definition: AutomationDefinition,
        }),
      ),
    ),
  fields: base
    .route({
      method: 'GET',
      path: '/automations/fields',
      summary:
        'Paths conditions and placeholders can use, with their types (custom fields included)',
    })
    .input(z.object({ subject: z.enum(CONTENT_TYPES).optional() }))
    .output(listOf(AutomationFieldPath)),
  remove: base
    .route({ method: 'DELETE', path: '/automations/{id}' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  runs: base
    .route({ method: 'GET', path: '/automations/{id}/runs' })
    .input(CursorQuery.extend({ id: Id, status: RunStatus.optional() }))
    .output(cursorPageOf(AutomationRun)),
  run: base
    .route({ method: 'GET', path: '/automations/runs/{runId}' })
    .input(z.object({ runId: Id }))
    .output(z.object({ run: AutomationRun, steps: z.array(RunStep) })),
  retryRun: base
    .route({
      method: 'POST',
      path: '/automations/runs/{runId}/retry',
      summary: 'Continue a failed run from the step that failed',
    })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
  cancelRun: base
    .route({
      method: 'POST',
      path: '/automations/runs/{runId}/cancel',
      summary: 'Stop a running or waiting run',
    })
    .input(z.object({ runId: Id }))
    .output(AutomationRun),
};
