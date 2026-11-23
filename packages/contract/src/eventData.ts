import type { DataField } from './automationRuns';

type EventData = { record: string; fields: readonly DataField[] };

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

/** An invoice event's record and values: created, cancelled and expired carry the invoice. */
export const INVOICE_DATA = { record: 'Invoice', fields: INVOICE_FIELDS } as const;

export const INVOICE_PAID_DATA = {
  record: 'Invoice',
  fields: [
    ...INVOICE_FIELDS,
    { key: 'paidAmount', label: 'Paid amount', type: 'number' },
    { key: 'gateway', label: 'Paid through', type: 'text' },
  ],
} as const satisfies EventData;

export const INVOICE_REFUNDED_DATA = {
  record: 'Invoice',
  fields: [
    ...INVOICE_FIELDS,
    { key: 'refundAmount', label: 'Refunded now', type: 'number' },
    { key: 'refundedAmount', label: 'Refunded in all', type: 'number' },
  ],
} as const satisfies EventData;

export const RECEIPT_DATA = {
  record: 'eBarimt receipt',
  fields: [
    { key: 'receiptId', label: 'Receipt', type: 'text' },
    { key: 'invoiceId', label: 'Invoice', type: 'text' },
    { key: 'billId', label: 'Bill id', type: 'text' },
    { key: 'billDate', label: 'Bill date', type: 'text' },
    { key: 'lottery', label: 'Lottery number', type: 'text' },
    { key: 'buyerType', label: 'Buyer type', type: 'text' },
    { key: 'customerTin', label: 'Buyer TIN', type: 'text' },
    { key: 'customerName', label: 'Buyer name', type: 'text' },
    { key: 'totalAmount', label: 'Total', type: 'number' },
    { key: 'totalVat', label: 'VAT', type: 'number' },
    { key: 'totalCityTax', label: 'City tax', type: 'number' },
    { key: 'previousId', label: 'Replaces receipt', type: 'text' },
    { key: 'referenceType', label: 'For (record type)', type: 'text' },
    { key: 'referenceId', label: 'For (record id)', type: 'text' },
  ],
} as const satisfies EventData;

export const NOTE_DATA = {
  record: 'Note',
  fields: [
    { key: 'noteId', label: 'Note', type: 'text' },
    { key: 'body', label: 'Text', type: 'text' },
    { key: 'authorId', label: 'Written by', type: 'text' },
  ],
} as const satisfies EventData;

export const SUPPRESSION_DATA = {
  record: 'Suppressed address',
  fields: [
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'channel', label: 'Channel', type: 'text' },
    { key: 'reason', label: 'Reason', type: 'text' },
    { key: 'detail', label: 'Detail', type: 'text' },
    { key: 'broadcastId', label: 'Broadcast', type: 'text' },
    { key: 'customerId', label: 'Customer', type: 'text' },
  ],
} as const satisfies EventData;

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
} as const satisfies EventData;

export const APP_TRIGGER_FAILED_DATA = {
  record: 'App connection',
  fields: [
    { key: 'app', label: 'App', type: 'text' },
    { key: 'connectionId', label: 'Connection', type: 'text' },
    { key: 'error', label: 'Error', type: 'text' },
  ],
} as const satisfies EventData;

export const INTEGRATION_CHANGED_DATA = {
  record: 'App connection',
  fields: [
    { key: 'key', label: 'Integration', type: 'text' },
    { key: 'connectionId', label: 'Connection', type: 'text' },
    { key: 'change', label: 'Change', type: 'text' },
  ],
} as const satisfies EventData;
