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

export const APP_TRIGGER_FAILED_DATA = {
  record: 'App connection',
  fields: [
    { key: 'app', label: 'App', type: 'text' },
    { key: 'connectionId', label: 'Connection', type: 'text' },
    { key: 'error', label: 'Error', type: 'text' },
  ],
} as const satisfies { record: string; fields: readonly DataField[] };

export const INTEGRATION_CHANGED_DATA = {
  record: 'App connection',
  fields: [
    { key: 'key', label: 'Integration', type: 'text' },
    { key: 'connectionId', label: 'Connection', type: 'text' },
    { key: 'change', label: 'Change', type: 'text' },
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

const event = (
  type: string,
  label: string,
  subject: CoreEventType['subject'],
  description: string,
) => ({ type, label, subject, description });

/**
 * Events core publishes (plugins add theirs through their manifest). Webhooks
 * subscribe to them; automations start from them.
 */
export const CORE_EVENT_TYPES = [
  event(
    'core.customer.created',
    'Customer created',
    'customer',
    'A person is added (by hand, an import, a form or a plugin)',
  ),
  event(
    'core.customer.updated',
    'Customer updated',
    'customer',
    'A person’s fields, owner or properties change',
  ),
  event(
    'core.customer.deleted',
    'Customer deleted',
    'customer',
    'A person is deleted (to the recycle bin)',
  ),
  event(
    'core.customer.merged',
    'Customers merged',
    'customer',
    'Duplicates are merged into one person',
  ),
  event(
    'core.customer.tagged',
    'Customer tagged',
    'customer',
    'Tags are added to or removed from a person',
  ),
  event(
    'core.customer.company_linked',
    'Customer linked to a company',
    'customer',
    'A person is linked to a company',
  ),
  event(
    'core.customer.company_unlinked',
    'Customer unlinked from a company',
    'customer',
    'A person is unlinked from a company',
  ),
  event(
    'core.customer.signed_up',
    'Customer signed up',
    'customer',
    'A person makes an account on one of your portals',
  ),
  event(
    'core.customer.signed_in',
    'Customer signed in',
    'customer',
    'A person signs in to one of your portals with a code',
  ),
  event(
    'core.lead.stage_changed',
    'Lead moved to another stage',
    'customer',
    'A lead (person or company) moves to another stage',
  ),
  event('core.lead.converted', 'Lead became a customer', 'customer', 'A lead becomes a customer'),
  event('core.company.created', 'Company created', 'company', 'A company is added'),
  event(
    'core.company.updated',
    'Company updated',
    'company',
    'A company’s fields, owner or properties change',
  ),
  event(
    'core.company.deleted',
    'Company deleted',
    'company',
    'A company is deleted (to the recycle bin)',
  ),
  event(
    'core.company.merged',
    'Companies merged',
    'company',
    'Duplicate companies are merged into one',
  ),
  event(
    'core.company.tagged',
    'Company tagged',
    'company',
    'Tags are added to or removed from a company',
  ),
  event(
    'core.customer.restored',
    'Customer restored',
    'customer',
    'A deleted person is restored from the recycle bin',
  ),
  event(
    'core.company.restored',
    'Company restored',
    'company',
    'A deleted company is restored from the recycle bin',
  ),
  event(
    'core.product.created',
    'Product added',
    null,
    'A product is added to the catalog (by a member or a plugin)',
  ),
  event(
    'core.product.updated',
    'Product updated',
    null,
    'A product’s fields, or the plugins that use it, change',
  ),
  event(
    'core.product.archived',
    'Product archived',
    null,
    'A product is taken out of lists; orders keep it',
  ),
  event('core.product.restored', 'Product restored', null, 'An archived product is back in lists'),
  {
    ...event('core.payment.paid', 'Invoice paid', null, 'An invoice is paid'),
    ...INVOICE_PAID_DATA,
  },
  {
    ...event('core.payment.cancelled', 'Invoice cancelled', null, 'An invoice is cancelled'),
    ...INVOICE_DATA,
  },
  {
    ...event('core.payment.expired', 'Invoice expired unpaid', null, 'An invoice expires unpaid'),
    ...INVOICE_DATA,
  },
  {
    ...event(
      'core.payment.refunded',
      'Payment refunded',
      null,
      'A payment is refunded, in part or in full',
    ),
    ...INVOICE_REFUNDED_DATA,
  },
  {
    ...event(
      'core.automation.failed',
      'Automation failed',
      null,
      'A run of another automation fails at a step',
    ),
    ...AUTOMATION_FAILED_DATA,
  },
  {
    ...event(
      'core.integration.trigger_failed',
      'App trigger stopped',
      null,
      'A connected app stops sending events: its webhook or polling keeps failing',
    ),
    ...APP_TRIGGER_FAILED_DATA,
  },
  {
    ...event(
      'core.integration.changed',
      'App connection changed',
      null,
      'A connection is added, its keys or sign-in change, or it is turned off or removed (`change`): plugins that use it read it again',
    ),
    ...INTEGRATION_CHANGED_DATA,
  },
] satisfies readonly CoreEventType[];
