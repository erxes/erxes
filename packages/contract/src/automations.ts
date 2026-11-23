import { CONTENT_TYPES } from '@erxes/core-db/enums';
import { automations } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Automation, HookSample } from './automation';
import { AutomationApp } from './integrations';
import { AutomationStatus } from './values';
import { AutomationDefinition } from '@erxes/core-db/automationDefinition';
import {
  ActionInfo,
  AutomationFieldPath,
  AutomationRun,
  DataField,
  DryRun,
  RunStatus,
  RunStep,
} from './automationRuns';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf } from './common';

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
/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  CROSS_SITE: ERRORS.CROSS_SITE,
  INVALID_AUTOMATION: ERRORS.INVALID_AUTOMATION,
  INVALID_FILE: ERRORS.INVALID_FILE,
  INVALID_LEAD_STAGE: ERRORS.INVALID_LEAD_STAGE,
  INVALID_RECIPIENT: ERRORS.INVALID_RECIPIENT,
  INVALID_STEP_INPUT: ERRORS.INVALID_STEP_INPUT,
  INVALID_URL: ERRORS.INVALID_URL,
  LIMIT_EXCEEDED: ERRORS.LIMIT_EXCEEDED,
  NOT_ACTIVE: ERRORS.NOT_ACTIVE,
  NOT_AUTHOR: ERRORS.NOT_AUTHOR,
  NOT_FAILED: ERRORS.NOT_FAILED,
  NOT_RUNNING: ERRORS.NOT_RUNNING,
  NO_MEMBERS: ERRORS.NO_MEMBERS,
  NO_SUBJECT: ERRORS.NO_SUBJECT,
});

export const automationsContract = {
  catalog: base
    .route({
      method: 'GET',
      path: '/automations/catalog',
      summary: 'List triggers and actions',
      description: "Triggers (event types) and actions: core's and installed plugins'",
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
            /** The record it is about, as its plugin names it (`Order`). */
            record: z.string().nullable(),
            /**
             * Its payload's values later steps can insert (`{{event.payload.<key>}}`): what its
             * publisher lists, then what its events have carried in this organisation.
             */
            fields: z.array(DataField),
            /** One has happened here since core began remembering what plugins' events carry. */
            seen: z.boolean(),
          }),
        ),
        actions: z.array(ActionInfo),
        apps: z.array(AutomationApp),
      }),
    ),
  list: base
    .route({ method: 'GET', path: '/automations', summary: 'List automations' })
    .input(z.object({ status: AutomationStatus.optional() }))
    .output(listOf(Automation)),
  get: base
    .route({ method: 'GET', path: '/automations/{id}', summary: 'Get an automation' })
    .input(z.object({ id: Id }))
    .output(Automation),
  create: base
    .route({
      method: 'POST',
      path: '/automations',
      successStatus: 201,
      summary: 'Create an automation',
    })
    .input(Fields.required({ name: true, definition: true }))
    .output(Automation),
  update: base
    .route({
      method: 'PATCH',
      path: '/automations/{id}',
      summary: 'Change an automation',
      description: 'An active one publishes a new version; runs in progress keep theirs',
    })
    .input(Fields.extend({ id: Id }))
    .output(Automation),
  check: base
    .route({
      method: 'POST',
      path: '/automations/check',
      summary: 'Check an automation before turning it on',
      description:
        'What would stop a definition from being turned on (unknown steps, missing fields, broken templates); nothing is saved',
    })
    .input(z.object({ definition: AutomationDefinition }))
    .output(z.object({ problems: z.array(z.string()) })),
  activate: base
    .route({
      method: 'POST',
      path: '/automations/{id}/activate',
      summary: 'Turn on an automation',
      description: 'Check and turn on (as the member, whose permissions its actions use)',
    })
    .input(z.object({ id: Id }))
    .output(Automation),
  pause: base
    .route({ method: 'POST', path: '/automations/{id}/pause', summary: 'Pause an automation' })
    .input(z.object({ id: Id }))
    .output(Automation),
  start: base
    .route({
      method: 'POST',
      path: '/automations/{id}/start',
      summary: 'Run an automation now',
      description: 'Run a manual (or any) automation now: on the given records, or on its audience',
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
      summary: 'Test an automation',
      description:
        'Dry run of the working copy (or a draft definition): what each step would do for a record (nothing is changed)',
    })
    .input(
      z
        .object({
          id: Id,
          definition: AutomationDefinition.optional(),
          /** The record to run for: send both, or neither for a run without one. */
          subjectType: z.enum(CONTENT_TYPES).optional(),
          subjectId: Id.optional(),
          /**
           * Event fields for the trigger (type, payload); defaults to the trigger's event. For a
           * webhook trigger, the sample request: `{ method, query, headers, body }`.
           */
          payload: z.record(z.string(), z.unknown()).optional(),
          /** Pretend waits for events end with the event happening. */
          assumeEventHappens: z.boolean().default(false),
        })
        .refine((input) => (input.subjectType === undefined) === (input.subjectId === undefined), {
          message: 'Send subjectType and subjectId together',
          path: ['subjectId'],
        }),
    )
    .output(DryRun),
  saveSample: base
    .route({
      method: 'PUT',
      path: '/automations/{id}/sample',
      summary: 'Save a webhook sample',
      description:
        'Keep a webhook request as the sample: its fields fill the editor’s lists and the test uses it',
    })
    .input(HookSample.pick({ body: true, query: true }).extend({ id: Id }))
    .output(Automation),
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
  versions: base
    .route({
      method: 'GET',
      path: '/automations/{id}/versions',
      summary: 'List automation versions',
      description: 'The 100 latest published versions, newest first',
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
      summary: 'Restore an automation version',
      description:
        'Make an older version the working copy (and publish it if the automation is on)',
    })
    .input(z.object({ id: Id, version: z.coerce.number().int().min(1) }))
    .output(Automation),
  templates: base
    .route({
      method: 'GET',
      path: '/automations/templates',
      summary: 'List automation templates',
      description: 'Ready-made automations to start from',
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
      summary: 'List fields automations can use',
      description:
        'Paths conditions and placeholders can use, with their types (custom fields included; with `automation`, what its webhook requests carried)',
    })
    .input(z.object({ subject: z.enum(CONTENT_TYPES).optional(), automation: Id.optional() }))
    .output(listOf(AutomationFieldPath)),
  remove: base
    .route({ method: 'DELETE', path: '/automations/{id}', summary: 'Delete an automation' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
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
