import {
  ACTION_FIELD_TYPES,
  AUTOMATION_FIELD_GROUPS,
  AUTOMATION_FIELD_TYPES,
  AUTOMATION_PATH_TYPES,
  AUTOMATION_SUBJECTS,
  RUN_STATUSES,
} from '@erxes/core-db/enums';
import { automationRunSteps, automationRuns } from '@erxes/core-db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';
import { EventType } from './platform';
import { IntegrationKey } from './values';
import { FilterField } from './views';

// ─── Catalog ────────────────────────────────────────────────────────────────

/** A kind of a plugin's own records (`pipeline`, `stage`) its API lists for the builder's pickers. */
const RecordType = z
  .string()
  .regex(/^[a-z][a-z0-9_-]{0,59}$/, 'lower case letters, digits, _ and -');

/**
 * A value later steps can use: one an event carries (`{{event.payload.<key>}}`) or an
 * action answers (`{{steps.<step id>.output.<key>}}`). The builder lists them in
 * "Insert data" and in conditions, by `label`.
 */
export const DataField = z.object({
  key: z
    .string()
    .regex(
      /^[A-Za-z][A-Za-z0-9_]{0,59}(\.[A-Za-z][A-Za-z0-9_]{0,59}){0,3}$/,
      'letters, digits and _, starting with a letter; a dot reaches inside an object',
    ),
  label: z.string().trim().min(1).max(100),
  type: z.enum(AUTOMATION_FIELD_TYPES),
  /**
   * The value is the id of one of the plugin's records (`stage`): conditions pick it from
   * `GET <api.url>/automations/records/<recordType>` (no `parent`: all of them), as a
   * `plugin_record` input does, instead of typing an id, and that input's picker offers it
   * ("Task created: Task").
   */
  recordType: RecordType.optional(),
});

export type DataField = z.infer<typeof DataField>;

/**
 * A path conditions and placeholders can read, with how its values compare: the event's, or the
 * record's as its lists filter it (`FilterField`: choices, relations and money included), so a
 * condition means the same in an automation as in a saved view.
 */
export const AutomationFieldPath = FilterField.extend({
  type: z.enum(AUTOMATION_PATH_TYPES),
  group: z.enum(AUTOMATION_FIELD_GROUPS).optional(),
  /** Placeholders can't insert it: a measure of related records, the linked company's fields. */
  conditionsOnly: z.boolean().optional(),
});

export type AutomationFieldPath = z.infer<typeof AutomationFieldPath>;

/**
 * One input of an action. Besides plain values: `custom_field` (one of the
 * subject's custom fields, by id), `lead_stage` (a lead stage, by id),
 * `recipients` (`subject` = the record's own email, or addresses),
 * `plugin_record` (one of the plugin's own records of `recordType`, by id),
 * `connection` (one of the action's integration's active connections, by id, from `options`;
 * empty: the default one). Only core's integration actions take a `connection`.
 */
export const ActionField = z
  .object({
    key: z.string(),
    label: z.string(),
    type: z.enum(ACTION_FIELD_TYPES),
    required: z.boolean().default(false),
    options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    /** The key of a `custom_field` input: this value takes that field's type (a date, a choice …). */
    sameTypeAs: z.string().optional(),
    /**
     * A `plugin_record` input's records (`pipeline`): web lists them from
     * `GET <api.url>/automations/records/<recordType>`, which answers `[{ value, label }]`,
     * and offers the run's values of that `recordType` (the trigger's task, a created deal).
     */
    recordType: RecordType.optional(),
    /** A `plugin_record` input that takes several records: its value is a list of ids. */
    multiple: z.boolean().optional(),
    /**
     * The key of another input of the action: the records follow its value
     * (`?parent=<value>`), and changing it clears this one.
     */
    dependsOn: z.string().optional(),
  })
  .refine((field) => (field.type === 'plugin_record') === (field.recordType !== undefined), {
    message: 'a plugin_record input names its recordType, and no other input does',
    path: ['recordType'],
  })
  .refine((field) => field.multiple === undefined || field.type === 'plugin_record', {
    message: 'only a plugin_record input takes several records',
    path: ['multiple'],
  })
  .refine((field) => field.dependsOn === undefined || field.type === 'plugin_record', {
    message: 'only a plugin_record input depends on another',
    path: ['dependsOn'],
  });

export type ActionField = z.infer<typeof ActionField>;

/** Whether following `dependsOn` from some input comes back to a key it passed. */
const dependsInCircle = (fields: ActionField[]) => {
  const parentOf = new Map(fields.map((field) => [field.key, field.dependsOn]));

  return fields.some((field) => {
    const seen = new Set([field.key]);

    for (let key = field.dependsOn; key !== undefined; key = parentOf.get(key)) {
      if (seen.has(key)) return true;

      seen.add(key);
    }

    return false;
  });
};

/** A plugin action's inputs: each `dependsOn` names another of them, with no circle. */
export const ActionFields = z
  .array(ActionField)
  .max(50)
  .refine(
    (fields) => fields.every((field) => field.type !== 'connection'),
    "connection inputs are core's own",
  )
  .refine(
    (fields) =>
      fields.every(
        (field) =>
          field.dependsOn === undefined ||
          (field.dependsOn !== field.key && fields.some((other) => other.key === field.dependsOn)),
      ),
    'dependsOn names another input of the same action',
  )
  .refine(
    (fields) =>
      fields.every(
        (field) => !fields.some((other) => other.key === field.dependsOn && other.multiple),
      ),
    'dependsOn names an input of one record, not a multiple one',
  )
  .refine(
    (fields) => !dependsInCircle(fields),
    'dependsOn inputs depend on each other in a circle',
  );

/**
 * An action a plugin's manifest declares for automations (`hr.leave.create`): core POSTs
 * `{ input, context }` to `<api.url>/automations/actions/<type>` with a core token and an
 * `Idempotency-Key`; the JSON answer is the step's output. A `plugin_record` field's choices
 * come from `GET <api.url>/automations/records/<recordType>?parent=<its dependsOn value>`,
 * called with the member's session token, answering `[{ value, label }]`.
 */
export const PluginAction = z.object({
  type: EventType,
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional(),
  subject: z.enum(AUTOMATION_SUBJECTS).optional(),
  /** One of the manifest's `integrations` it acts through, else 400 UNKNOWN_INTEGRATION. */
  integration: IntegrationKey.optional(),
  fields: ActionFields.default([]),
  /** What its JSON answer holds that later steps can insert (`dealId` as "Deal"). */
  outputs: z.array(DataField).max(50).optional(),
});

export const ActionInfo = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  source: z.string(),
  /**
   * The integration it belongs to: core's (`qpay`, listed only while connected here) or a
   * plugin's (`frontline.facebook`); null for an action of no integration.
   */
  integration: z.string().nullable(),
  /** That integration's name (`QPay`), for the builder's group. */
  integrationName: z.string().nullable(),
  /** Needs a customer or company as the run's subject. */
  subject: z.enum(AUTOMATION_SUBJECTS).nullable(),
  fields: z.array(ActionField),
  /** What the step answers, for later steps (`dealId` of "Create a deal"). */
  outputs: z.array(DataField),
});

export type ActionInfo = z.infer<typeof ActionInfo>;

// ─── Runs ───────────────────────────────────────────────────────────────────

export const RunStatus = z.enum(RUN_STATUSES);

const int = () => z.int();

export const AutomationRun = createSelectSchema(automationRuns, {
  id: Id,
  automationId: Id,
  version: int,
  waitingUntil: isoDate,
  startedAt: isoDate,
  finishedAt: isoDate,
  goalReachedAt: isoDate,
})
  .pick({
    id: true,
    automationId: true,
    version: true,
    eventId: true,
    eventType: true,
    /** The customer or company the run is about. */
    subjectType: true,
    subjectId: true,
    status: true,
    error: true,
    waitingUntil: true,
    startedAt: true,
    finishedAt: true,
    /** Left early because the automation's goal was met. */
    goalReachedAt: true,
  })
  .extend({
    /** The customer's or company's name now; null once it is deleted. */
    subjectName: z.string().nullable(),
  });

export type AutomationRun = z.infer<typeof AutomationRun>;

export const RunStep = createSelectSchema(automationRunSteps, {
  id: Id,
  input: () => z.unknown(),
  output: () => z.unknown(),
  attempt: int,
  startedAt: isoDate,
  finishedAt: isoDate,
}).pick({
  id: true,
  stepId: true,
  type: true,
  status: true,
  input: true,
  output: true,
  error: true,
  attempt: true,
  startedAt: true,
  finishedAt: true,
});

export type RunStep = z.infer<typeof RunStep>;

/** One step of a dry run: what it would do, and what would stop it. */
export const DryRunStep = z.object({
  stepId: z.string(),
  type: z.string(),
  outcome: z.string(),
  input: z.unknown().nullable(),
  problem: z.string().nullable(),
});

export type DryRunStep = z.infer<typeof DryRunStep>;

/** A dry run: whether the trigger matches, and what each step would do. */
export const DryRun = z.object({
  triggerMatches: z.boolean(),
  goalMetAtStart: z.boolean(),
  trace: z.array(DryRunStep),
});
