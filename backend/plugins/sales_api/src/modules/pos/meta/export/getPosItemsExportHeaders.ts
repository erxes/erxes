import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getPosItemsExportHeaders(
  _data: unknown,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { key: 'number', label: 'Number', isDefault: true },
    { key: 'createdAt', label: 'Created Date', isDefault: true },
    { key: 'posName', label: 'POS Name', isDefault: true },
    { key: 'branch', label: 'Branch', isDefault: false },
    { key: 'department', label: 'Department', isDefault: false },
    { key: 'cashier', label: 'Cashier', isDefault: false },
    { key: 'type', label: 'Type', isDefault: false },
    { key: 'billType', label: 'Bill Type', isDefault: false },
    { key: 'registerNumber', label: 'Company RD', isDefault: false },
    { key: 'customerType', label: 'Customer Type', isDefault: false },
    { key: 'customer', label: 'Customer', isDefault: false },
    { key: 'productCode', label: 'Code', isDefault: true },
    { key: 'productName', label: 'Product Name', isDefault: true },
    { key: 'categoryCode', label: 'Category Code', isDefault: false },
    { key: 'categoryName', label: 'Category Name', isDefault: false },
    { key: 'barcode', label: 'Barcode', isDefault: false },
    { key: 'count', label: 'Count', isDefault: true },
    { key: 'unitPrice', label: 'Unit Price', isDefault: true },
    { key: 'discountAmount', label: 'Discount', isDefault: false },
    { key: 'totalAmount', label: 'Total Amount', isDefault: true },
    { key: 'paymentType', label: 'Payment Type', isDefault: false },
  ];
}
