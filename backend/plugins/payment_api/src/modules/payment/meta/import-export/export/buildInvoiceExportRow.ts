import { IInvoiceDocument } from '~/modules/payment/@types/invoices';

export type TInvoiceExportRow = Record<string, string>;

/**
 * Neutralizes CSV formula injection: spreadsheet clients (Excel, Google Sheets)
 * evaluate a cell as a formula when it starts with =, +, -, @, tab or CR. The
 * shared CSV writer only handles RFC 4180 quoting, so we prefix risky strings
 * with a single quote to force them to be treated as text.
 */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const sanitizeForCsv = (value: string): string =>
  FORMULA_PREFIX.test(value) ? `'${value}` : value;

const formatValue = (value: unknown): string => {
  if (value == null) return '';
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  }
  // Numbers/booleans cannot carry a formula payload, so leave them intact
  // (avoids corrupting legitimate negative amounts into text).
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return sanitizeForCsv(String(value));
};

/**
 * Safely formats a date-like value, returning an empty string for missing or
 * unparseable values so a single bad record can never crash the export batch.
 */
const formatDate = (value: unknown): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

export const buildInvoiceExportRow = (
  invoice: IInvoiceDocument,
  selectedFields?: string[],
): TInvoiceExportRow => {
  const allFields: TInvoiceExportRow = {
    _id: formatValue(invoice._id),
    invoiceNumber: formatValue(invoice.invoiceNumber),
    description: formatValue(invoice.description),
    amount: formatValue(invoice.amount),
    currency: formatValue(invoice.currency),
    status: formatValue(invoice.status),
    phone: formatValue(invoice.phone),
    email: formatValue(invoice.email),
    customerType: formatValue(invoice.customerType),
    customerId: formatValue(invoice.customerId),
    contentType: formatValue(invoice.contentType),
    contentTypeId: formatValue(invoice.contentTypeId),
    scannedAt: formatDate(invoice.scannedAt),
    resolvedAt: formatDate(invoice.resolvedAt),
    createdAt: formatDate(invoice.createdAt),
  };

  if (selectedFields?.length) {
    const result: TInvoiceExportRow = { _id: formatValue(invoice._id) };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
