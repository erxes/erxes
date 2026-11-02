import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { toExportHeaders } from '~/meta/export/utils';

export const POS_ORDER_EXPORT_HEADERS = toExportHeaders([
  ['number', 'Number', true],
  ['createdAt', 'Created Date', true],
  ['paidDate', 'Paid Date', true],
  ['dueDate', 'Due Date'],
  ['posName', 'POS Name', true],
  ['status', 'Status', true],
  ['type', 'Type'],
  ['origin', 'Origin'],
  ['branch', 'Branch'],
  ['department', 'Department'],
  ['cashier', 'Cashier', true],
  ['customerType', 'Customer Type'],
  ['customer', 'Customer', true],
  ['billType', 'Bill Type'],
  ['registerNumber', 'Company RD'],
  ['billId', 'Bill ID'],
  ['products', 'Products'],
  ['itemCount', 'Item Count'],
  ['discountAmount', 'Discount'],
  ['totalAmount', 'Total Amount', true],
  ['finalAmount', 'Final Amount'],
  ['cashAmount', 'Cash Amount'],
  ['mobileAmount', 'Mobile Amount'],
  ['paidAmounts', 'Other Payments'],
  ['paymentTypes', 'Payment Types', true],
  ['dealNumber', 'Deal Number'],
  ['returnedAt', 'Returned At'],
  ['returnDescription', 'Return Description'],
  ['description', 'Description'],
]);

/** Fixed column list for POS order exports. */
export async function getPosOrdersExportHeaders(): Promise<
  ImportHeaderDefinition[]
> {
  return POS_ORDER_EXPORT_HEADERS;
}