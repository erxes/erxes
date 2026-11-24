import { LEAD_EVENTS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { InvoiceLine } from './invoiceLines';

const text = (title: string) => z.string().meta({ title });

const maybeText = (title: string) => z.string().nullable().meta({ title });

const number = (title: string) => z.number().meta({ title });

const ids = (title: string, fieldType: 'list' | 'tags' = 'list') =>
  z.array(z.string()).meta({ title, fieldType });

const member = (title: string) => z.string().nullable().meta({ title, fieldType: 'member' });

const Stage = (title: string) =>
  z
    .object({
      id: text(`${title} stage id`),
      name: text(`${title} stage`),
      kind: text(`${title} stage kind`),
      color: maybeText(`${title} stage color`),
    })
    .nullable();

const InvoicePayload = z.object({
  invoiceId: text('Invoice'),
  amount: number('Amount'),
  currency: text('Currency'),
  method: text('Method'),
  source: text('Created by'),
  referenceType: text('For (record type)'),
  referenceId: text('For (record id)'),
  metadata: z.record(z.string(), z.unknown()),
  lines: z.array(InvoiceLine).meta({ title: 'Lines' }),
});

export const INVOICE_DATA = { record: 'Invoice', payload: InvoicePayload } as const;

export const INVOICE_PAID_DATA = {
  record: 'Invoice',
  payload: InvoicePayload.extend({
    paidAmount: number('Paid amount'),
    gateway: maybeText('Paid through'),
  }),
} as const;

export const INVOICE_REFUNDED_DATA = {
  record: 'Invoice',
  payload: InvoicePayload.extend({
    refundId: text('Refund'),
    refundAmount: number('Refunded now'),
    refundedAmount: number('Refunded in all'),
    full: z.boolean().meta({ title: 'Refunded in full' }),
    method: text('Refunded through'),
  }),
} as const;

export const RECEIPT_DATA = {
  record: 'eBarimt receipt',
  payload: z.object({
    receiptId: text('Receipt'),
    invoiceId: text('Invoice'),
    billId: maybeText('Bill id'),
    billDate: z.string().nullable().meta({ title: 'Bill date', fieldType: 'date' }),
    lottery: maybeText('Lottery number'),
    buyerType: text('Buyer type'),
    customerTin: maybeText('Buyer TIN'),
    customerName: maybeText('Buyer name'),
    totalAmount: number('Total'),
    totalVat: number('VAT'),
    totalCityTax: number('City tax'),
    previousId: maybeText('Replaces receipt'),
    referenceType: text('For (record type)'),
    referenceId: text('For (record id)'),
  }),
} as const;

export const NOTE_DATA = {
  record: 'Note',
  payload: z.object({
    noteId: text('Note'),
    body: text('Text'),
    authorId: z.string().meta({ title: 'Written by', fieldType: 'member' }),
  }),
} as const;

export const SUPPRESSION_DATA = {
  record: 'Suppressed address',
  payload: z.object({
    address: text('Address'),
    channel: text('Channel'),
    reason: text('Reason'),
    detail: maybeText('Detail'),
    broadcastId: maybeText('Broadcast'),
    customerId: maybeText('Customer'),
  }),
} as const;

export const AUTOMATION_FAILED_DATA = {
  record: 'Automation',
  payload: z.object({
    automationId: text('Automation'),
    automationName: text('Automation name'),
    runId: text('Run'),
    stepId: maybeText('Failed step'),
    error: text('Error'),
    recordType: maybeText('About (record type)'),
    recordId: maybeText('About (record id)'),
  }),
} as const;

export const APP_TRIGGER_FAILED_DATA = {
  record: 'App connection',
  payload: z.object({
    app: text('App'),
    connectionId: text('Connection'),
    triggers: z.array(z.string()).meta({ title: 'Triggers' }),
    error: text('Error'),
  }),
} as const;

export const INTEGRATION_CHANGED_DATA = {
  record: 'App connection',
  payload: z.object({
    key: text('Integration'),
    connectionId: text('Connection'),
    change: text('Change'),
  }),
} as const;

export const PRODUCT_DATA = {
  record: 'Product',
  payload: z.object({
    productId: text('Product'),
    name: text('Name'),
    code: maybeText('Code'),
    barcode: maybeText('Barcode'),
    kind: text('Kind'),
    status: text('Status'),
    categoryId: maybeText('Category'),
    unit: text('Unit'),
    price: number('Price'),
    currency: text('Currency'),
    changed: z.array(z.string()).meta({ title: 'Changed fields' }),
  }),
} as const;

export const CONTACT_CREATED_DATA = {
  payload: z.object({ label: text('Name'), ownerId: member('Owner') }),
} as const;

export const CONTACT_UPDATED_DATA = {
  payload: z.object({ changes: z.record(z.string(), z.unknown()) }),
} as const;

export const CONTACT_DELETED_DATA = {
  payload: z.object({ label: text('Name') }),
  subjectGone: true,
} as const;

export const CONTACT_MERGED_DATA = { payload: z.object({ mergedIds: ids('Merged ids') }) } as const;

export const CONTACT_TAGGED_DATA = {
  payload: z.object({ added: ids('Tags added', 'tags'), removed: ids('Tags removed', 'tags') }),
} as const;

export const COMPANY_LINK_DATA = {
  payload: z.object({ customerId: text('Customer'), companyId: text('Company') }),
} as const;

export const SIGN_IN_DATA = {
  payload: z.object({ kind: text('Signed in with'), portalId: text('Portal') }),
} as const;

export const LEAD_DATA = {
  payload: z.object({
    event: z.enum(LEAD_EVENTS).meta({ title: 'Change' }),
    from: Stage('From'),
    to: Stage('To'),
    reason: maybeText('Reason'),
  }),
} as const;

export const DATE_TRIGGER_DATA = z.object({
  date: z.string().nullable().meta({ title: 'Date', fieldType: 'date' }),
  day: z.string().meta({ title: 'Today', fieldType: 'date' }),
  offsetDays: number('Days from the date'),
});

export const SCHEDULE_TRIGGER_DATA = z.object({ every: text('Repeats') });
