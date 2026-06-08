import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getCustomPropertyHeaders } from '~/meta/import-export/utils';

export async function getProductExportHeaders(
  _data: any,
  ctx: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  const models = ctx?.models as IModels | undefined;

  const customHeaders = models
    ? await getCustomPropertyHeaders(models, 'core:product')
    : [];

  return [
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Code', key: 'code', isDefault: true },
    { label: 'Unit Price', key: 'unitPrice', isDefault: true },
    { label: 'UOM', key: 'uom', isDefault: true },
    { label: 'Category', key: 'categoryName' },
    { label: 'Vendor', key: 'vendorId' },
    { label: 'Brands', key: 'scopeBrandIds' },
    { label: 'Tags', key: 'tags' },
    { label: 'Short Name', key: 'shortName' },
    { label: 'Type', key: 'type' },
    { label: 'Status', key: 'status' },
    { label: 'Description', key: 'description' },
    { label: 'Barcodes', key: 'barcodes' },
    { label: 'Barcode Description', key: 'barcodeDescription' },
    { label: 'Image', key: 'imageUrl' },
    { label: 'Additional Images', key: 'imageUrls' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
    ...customHeaders,
  ];
}
