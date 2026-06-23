import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

const INVOICE_EXPORT_HEADERS: ImportHeaderDefinition[] = [
  { label: 'Invoice Number', key: 'invoiceNumber', isDefault: true },
  { label: 'Description', key: 'description', isDefault: true },
  { label: 'Amount', key: 'amount', isDefault: true },
  { label: 'Currency', key: 'currency', isDefault: true },
  { label: 'Status', key: 'status', isDefault: true },
  { label: 'Phone', key: 'phone' },
  { label: 'Email', key: 'email' },
  { label: 'Customer Type', key: 'customerType' },
  { label: 'Customer ID', key: 'customerId' },
  { label: 'Content Type', key: 'contentType' },
  { label: 'Content Type ID', key: 'contentTypeId' },
  { label: 'Scanned At', key: 'scannedAt' },
  { label: 'Resolved At', key: 'resolvedAt' },
  { label: 'Created At', key: 'createdAt', isDefault: true },
];

/**
 * The invoice fields exposed by the export. Used both to build the export
 * headers and to project the invoice query, so the data fetched from the DB
 * never includes fields that are not part of the export.
 */
export const INVOICE_EXPORT_FIELD_KEYS: string[] = INVOICE_EXPORT_HEADERS.map(
  (header) => header.key,
);

export async function getInvoiceExportHeaders(
  _data: unknown,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [...INVOICE_EXPORT_HEADERS];
}
