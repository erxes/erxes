import { CONTENT_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';
import { DataField } from './automationRuns';
import type { CORE_EVENT_TYPES } from './eventTypes';

/** One of core's events (`CORE_EVENT_TYPES`). */
export type CoreEventType = {
  type: string;
  label: string;
  subject: (typeof CONTENT_TYPES)[number] | null;
  description: string;
  /** Like a plugin event's: the record it is about, and its payload, whose values automations insert. */
  record?: string;
  payload?: z.ZodObject;
  subjectGone?: boolean;
};

export const EventTypeInfo = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  /** `core` or the plugin that publishes it. */
  source: z.string(),
  /** The record it is about, when it is about a customer or company. */
  subject: z.enum(CONTENT_TYPES).nullable(),
  subjectGone: z.boolean().optional(),
  /** What it is about, as its publisher names it (`Invoice`, `Order`). */
  record: z.string().nullable(),
  /** Its payload's values automations insert (`{{event.payload.<key>}}`). */
  fields: z.array(DataField),
});

export type EventTypeInfo = z.infer<typeof EventTypeInfo>;

type CoreEvent = (typeof CORE_EVENT_TYPES)[number];

export type CoreEventName = CoreEvent['type'];

export type WithCorePayload<T extends CoreEventName> =
  Extract<CoreEvent, { type: T }> extends { payload: infer S extends z.ZodObject }
    ? { payload: z.input<S> }
    : { payload?: Record<string, unknown> };

export const event = <T extends string>(
  type: T,
  label: string,
  subject: CoreEventType['subject'],
  description: string,
) => ({ type, label, subject, description });
