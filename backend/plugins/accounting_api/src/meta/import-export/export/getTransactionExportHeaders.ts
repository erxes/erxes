import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';

export const getTransactionExportHeaders = async (): Promise<
  ImportHeaderDefinition[]
> => [
  { label: 'ID', key: '_id' },
  { label: 'Date', key: 'date', isDefault: true, dataType: 'date' },
  { label: 'Number', key: 'number', isDefault: true },
  { label: 'Journal', key: 'journal', isDefault: true },
  { label: 'Description', key: 'description', isDefault: true },
  { label: 'Status', key: 'status', isDefault: true },
  { label: 'Side', key: 'side', isDefault: true },
  { label: 'Account code', key: 'accountCode', isDefault: true },
  { label: 'Account name', key: 'accountName', isDefault: true },
  { label: 'Branch ID', key: 'branchId' },
  { label: 'Department ID', key: 'departmentId' },
  { label: 'Amount', key: 'amount', isDefault: true, dataType: 'number' },
  { label: 'Currency', key: 'currency', isDefault: true },
  { label: 'Currency amount', key: 'currencyAmount', dataType: 'number' },
  { label: 'Custom rate', key: 'customRate', dataType: 'number' },
  { label: 'Product ID', key: 'productId' },
  { label: 'Fixed asset ID', key: 'fixedAssetId' },
  { label: 'Fixed asset code', key: 'fixedAssetCode' },
  { label: 'Fixed asset name', key: 'fixedAssetName' },
  { label: 'Count', key: 'count', dataType: 'number' },
  { label: 'Unit price', key: 'unitPrice', dataType: 'number' },
  { label: 'Weight', key: 'weight', dataType: 'number' },
  { label: 'Customer type', key: 'customerType' },
  { label: 'Customer ID', key: 'customerId' },
  { label: 'Created by', key: 'createdBy' },
  { label: 'Modified by', key: 'modifiedBy' },
  { label: 'Created at', key: 'createdAt', dataType: 'date' },
  { label: 'Updated at', key: 'updatedAt', dataType: 'date' },
];
