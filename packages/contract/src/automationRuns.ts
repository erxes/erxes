import {
  ACTION_FIELD_TYPES,
  AUTOMATION_FIELD_TYPES,
  AUTOMATION_SUBJECTS,
  RUN_STATUSES,
} from '@erxes/core-db/enums';
import { automationRunSteps, automationRuns } from '@erxes/core-db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';

// ─── Catalog ────────────────────────────────────────────────────────────────

/**
 * A value later steps can use: one an event carries (`{{event.payload.<key>}}`) or an
 * action answers (`{{steps.<step id>.output.<key>}}`). The builder lists them in
 * "Insert data" and in conditions, by `label`.
 */
const RecordType = z
  .string()
  .regex(/^[a-z][a-z0-9_-]{0,59}$/, 'lower case letters, digits, _ and -');

export const DataField = z.object({
  key: z
    .string()
    .regex(/^[A-Za-z][A-Za-z0-9_]{0,59}$/, 'letters, digits and _, starting with a letter'),
  label: z.string().trim().min(1).max(100),
  type: z.enum(AUTOMATION_FIELD_TYPES),
  /**
   * The value is the id of one of the plugin's records of this type (a `plugin_record`
   * input's `recordType`): the builder offers it in that input's picker ("Task created: Task").
   */
  recordType: RecordType.optional(),
});

export type DataField = z.infer<typeof DataField>;

/**
 * One input of an action. Besides plain values: `custom_field` (one of the
 * subject's custom fields, by id), `lead_stage` (a lead stage, by id),
 * `recipients` (`subject` = the record's own email, or addresses),
 * `plugin_record` (one of the plugin's own records of `recordType`, by id).
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
    (fields) =>
      fields.every(
        (field) =>
          field.dependsOn === undefined ||
          (field.dependsOn !== field.key && fields.some((other) => other.key === field.dependsOn)),
      ),
    'dependsOn names another input of the same action',
  )
  .refine(
    (fields) => !dependsInCircle(fields),
    'dependsOn inputs depend on each other in a circle',
  );

export const ActionInfo = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  source: z.string(),
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
