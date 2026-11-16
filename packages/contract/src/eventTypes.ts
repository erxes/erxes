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

export type CoreEventType = {
  type: string;
  label: string;
  subject: (typeof CONTENT_TYPES)[number] | null;
  description: string;
  /** Like a plugin event's: the record it is about and the payload values automations insert. */
  record?: string;
  fields?: readonly DataField[];
};

/**
 * Events core publishes (plugins add theirs through their manifest). Webhooks
 * subscribe to them; automations start from them.
 */
export const CORE_EVENT_TYPES = [
  {
    type: 'core.customer.created',
    label: 'Customer created',
    subject: 'customer',
    description: 'A person is added (by hand, an import, a form or a plugin)',
  },
  {
    type: 'core.customer.updated',
    label: 'Customer updated',
    subject: 'customer',
    description: 'A person’s fields, owner or properties change',
  },
  {
    type: 'core.customer.deleted',
    label: 'Customer deleted',
    subject: 'customer',
    description: 'A person is deleted (to the recycle bin)',
  },
  {
    type: 'core.customer.merged',
    label: 'Customers merged',
    subject: 'customer',
    description: 'Duplicates are merged into one person',
  },
  {
    type: 'core.customer.tagged',
    label: 'Customer tagged',
    subject: 'customer',
    description: 'Tags are added to or removed from a person',
  },
  {
    type: 'core.customer.company_linked',
    label: 'Customer linked to a company',
    subject: 'customer',
    description: 'A person is linked to a company',
  },
  {
    type: 'core.customer.company_unlinked',
    label: 'Customer unlinked from a company',
    subject: 'customer',
    description: 'A person is unlinked from a company',
  },
  {
    type: 'core.customer.signed_up',
    label: 'Customer signed up',
    subject: 'customer',
    description: 'A person proves their first email address or phone and can sign in to apps',
  },
  {
    type: 'core.customer.signed_in',
    label: 'Customer signed in',
    subject: 'customer',
    description: 'A person signs in with a code',
  },
  {
    type: 'core.lead.stage_changed',
    label: 'Lead moved to another stage',
    subject: 'customer',
    description: 'A lead (person or company) moves to another stage',
  },
  {
    type: 'core.lead.converted',
    label: 'Lead became a customer',
    subject: 'customer',
    description: 'A lead becomes a customer',
  },
  {
    type: 'core.company.created',
    label: 'Company created',
    subject: 'company',
    description: 'A company is added',
  },
  {
    type: 'core.company.updated',
    label: 'Company updated',
    subject: 'company',
    description: 'A company’s fields, owner or properties change',
  },
  {
    type: 'core.company.deleted',
    label: 'Company deleted',
    subject: 'company',
    description: 'A company is deleted (to the recycle bin)',
  },
  {
    type: 'core.company.merged',
    label: 'Companies merged',
    subject: 'company',
    description: 'Duplicate companies are merged into one',
  },
  {
    type: 'core.company.tagged',
    label: 'Company tagged',
    subject: 'company',
    description: 'Tags are added to or removed from a company',
  },
  {
    type: 'core.customer.restored',
    label: 'Customer restored',
    subject: 'customer',
    description: 'A deleted person is restored from the recycle bin',
  },
  {
    type: 'core.company.restored',
    label: 'Company restored',
    subject: 'company',
    description: 'A deleted company is restored from the recycle bin',
  },
  {
    type: 'core.product.created',
    label: 'Product added',
    subject: null,
    description: 'A product is added to the catalog (by a member or a plugin)',
  },
  {
    type: 'core.product.updated',
    label: 'Product updated',
    subject: null,
    description: 'A product’s fields, or the plugins that use it, change',
  },
  {
    type: 'core.product.archived',
    label: 'Product archived',
    subject: null,
    description: 'A product is taken out of lists; orders keep it',
  },
  {
    type: 'core.product.restored',
    label: 'Product restored',
    subject: null,
    description: 'An archived product is back in lists',
  },
  {
    type: 'core.payment.paid',
    label: 'Invoice paid',
    subject: null,
    description: 'An invoice is paid',
    record: 'Invoice',
    fields: [
      ...INVOICE_FIELDS,
      { key: 'paidAmount', label: 'Paid amount', type: 'number' },
      { key: 'gateway', label: 'Paid through', type: 'text' },
    ],
  },
  {
    type: 'core.payment.cancelled',
    label: 'Invoice cancelled',
    subject: null,
    description: 'An invoice is cancelled',
    record: 'Invoice',
    fields: INVOICE_FIELDS,
  },
  {
    type: 'core.payment.expired',
    label: 'Invoice expired unpaid',
    subject: null,
    description: 'An invoice expires unpaid',
    record: 'Invoice',
    fields: INVOICE_FIELDS,
  },
  {
    type: 'core.payment.refunded',
    label: 'Payment refunded',
    subject: null,
    description: 'A payment is refunded, in part or in full',
    record: 'Invoice',
    fields: [
      ...INVOICE_FIELDS,
      { key: 'refundAmount', label: 'Refunded now', type: 'number' },
      { key: 'refundedAmount', label: 'Refunded in all', type: 'number' },
    ],
  },
] as const satisfies readonly CoreEventType[];

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
