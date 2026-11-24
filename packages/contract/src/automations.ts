import { CONTENT_TYPES } from '@erxes/core-db/enums';
import { automations } from '@erxes/core-db/schema';
import { createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Automation, HookSample } from './automation';
import { AutomationApp } from './integrations';
import { AutomationStatus } from './values';
import { AutomationDefinition } from '@erxes/core-db/automationDefinition';
import { automationBase as base } from './automationBase';
import { automationRunRoutes } from './automationRunRoutes';
import { ActionInfo, AutomationFieldPath, DataField, DryRun } from './automationRuns';
import { Id, isoDate, listOf } from './common';

export const CatalogSearch = z.object({
  search: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export type CatalogSearch = z.infer<typeof CatalogSearch>;

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
export const automationsContract = {
  catalog: base
    .route({
      method: 'GET',
      path: '/automations/catalog',
      summary: 'List triggers and actions',
      description:
        "Triggers (event types, app events) and actions: core's, its apps' (GitHub, Telegram, …) and installed plugins'. `search` (plain words, e.g. \"github issue opened\") answers only the best matching triggers and actions, `limit` of each (5 by default), and the apps they belong to with their connections",
    })
    .input(CatalogSearch.optional())
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
            subjectGone: z.boolean().optional(),
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
  ...automationRunRoutes,
};
