import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getProductExportHeaders(
  _data: any,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Code', key: 'code', isDefault: true },
    { label: 'Unit Price', key: 'unitPrice', isDefault: true },
    { label: 'UOM', key: 'uom', isDefault: true },
    { label: 'Category', key: 'categoryId' },
    { label: 'Vendor', key: 'vendorId' },
    { label: 'Brands', key: 'scopeBrandIds' }, 
    { label: 'Tags', key: 'tagIds' }, 
    { label: 'Short Name', key: 'shortName' },
    { label: 'Type', key: 'type' },
    { label: 'Status', key: 'status' },
    { label: 'Description', key: 'description' },
    { label: 'Barcodes', key: 'barcodes' },
    { label: 'Barcode Description', key: 'barcodeDescription' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}