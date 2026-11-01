import {
  IImportExportContext,
  ImportHeaderDefinition,
} from 'erxes-api-shared/core-modules';

export const POS_ORDER_EXPORT_HEADERS: ImportHeaderDefinition[] = [
  { label: 'Number', key: 'number', isDefault: true },
  { label: 'Created Date', key: 'createdAt', isDefault: true },
  { label: 'Paid Date', key: 'paidDate', isDefault: true },
  { label: 'Due Date', key: 'dueDate' },
  { label: 'POS Name', key: 'posName', isDefault: true },
  { label: 'Status', key: 'status', isDefault: true },
  { label: 'Type', key: 'type' },
  { label: 'Origin', key: 'origin' },
  { label: 'Branch', key: 'branch' },
  { label: 'Department', key: 'department' },
  { label: 'Cashier', key: 'cashier', isDefault: true },
  { label: 'Customer Type', key: 'customerType' },
  { label: 'Customer', key: 'customer', isDefault: true },
  { label: 'Bill Type', key: 'billType' },
  { label: 'Company RD', key: 'registerNumber' },
  { label: 'Bill ID', key: 'billId' },
  { label: 'Products', key: 'products' },
  { label: 'Item Count', key: 'itemCount' },
  { label: 'Discount', key: 'discountAmount' },
  { label: 'Total Amount', key: 'totalAmount', isDefault: true },
  { label: 'Final Amount', key: 'finalAmount' },
  { label: 'Cash Amount', key: 'cashAmount' },
  { label: 'Mobile Amount', key: 'mobileAmount' },
  { label: 'Other Payments', key: 'paidAmounts' },
  { label: 'Payment Types', key: 'paymentTypes', isDefault: true },
  { label: 'Deal Number', key: 'dealNumber' },
  { label: 'Returned At', key: 'returnedAt' },
  { label: 'Return Description', key: 'returnDescription' },
  { label: 'Description', key: 'description' },
];

export async function getPosOrdersExportHeaders(
  _args: unknown,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return POS_ORDER_EXPORT_HEADERS;
}
