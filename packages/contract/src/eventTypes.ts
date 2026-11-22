import { CONTENT_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';
import { DataField } from './automationRuns';

/** What core's invoice events carry (`eventPayload` in the payments module). */
const INVOICE_FIELDS = [
  { key: 'invoiceId', label: 'Invoice', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'method', label: 'Method', type: 'text' },
  { key: 'source', label: 'Created by', type: 'text' },
  { key: 'referenceType', label: 'For (record type)', type: 'text' },
  { key: 'referenceId', label: 'For (record id)', type: 'text' },
] as const satisfies readonly DataField[];

/** An invoice event's record and values: cancelled and expired carry the invoice. */
export const INVOICE_DATA = { record: 'Invoice', fields: INVOICE_FIELDS } as const;

export const INVOICE_PAID_DATA = {
  record: 'Invoice',
  fields: [
    ...INVOICE_FIELDS,
    { key: 'paidAmount', label: 'Paid amount', type: 'number' },
    { key: 'gateway', label: 'Paid through', type: 'text' },
  ],
} as const;

export const INVOICE_REFUNDED_DATA = {
  record: 'Invoice',
  fields: [
    ...INVOICE_FIELDS,
    { key: 'refundAmount', label: 'Refunded now', type: 'number' },
    { key: 'refundedAmount', label: 'Refunded in all', type: 'number' },
  ],
} as const;

export const AUTOMATION_FAILED_DATA = {
  record: 'Automation',
  fields: [
    { key: 'automationId', label: 'Automation', type: 'text' },
    { key: 'automationName', label: 'Automation name', type: 'text' },
    { key: 'runId', label: 'Run', type: 'text' },
    { key: 'stepId', label: 'Failed step', type: 'text' },
    { key: 'error', label: 'Error', type: 'text' },
    { key: 'recordType', label: 'About (record type)', type: 'text' },
    { key: 'recordId', label: 'About (record id)', type: 'text' },
  ],
} as const satisfies { record: string; fields: readonly DataField[] };

/** One of core's events (`CORE_EVENT_TYPES`). */
export type CoreEventType = {
  type: string;
  label: string;
  subject: (typeof CONTENT_TYPES)[number] | null;
  description: string;
  /** Like a plugin event's: the record it is about and the payload values automations insert. */
  record?: string;
  fields?: readonly DataField[];
};

export const EventTypeInfo = z.object({
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  /** `core` or the plugin that publishes it. */
  source: z.string(),
  /** The record it is about, when it is about a customer or company. */
  subject: z.enum(CONTENT_TYPES).nullable(),
  /** What it is about, as its publisher names it (`Invoice`, `Order`). */
  record: z.string().nullable(),
  /** Its payload's values automations insert (`{{event.payload.<key>}}`). */
  fields: z.array(DataField),
});

export type EventTypeInfo = z.infer<typeof EventTypeInfo>;
