import { PRODUCT_STATUSES, PRODUCT_TYPES } from '~/modules/products/constants';
import {
  TCoreModuleProducerContext,
  TInsertImportRowsInput,
  TGetImportHeadersOutput,
} from 'erxes-api-shared/core-modules';
import { processProductRows } from './processProductRows';
import { IModels } from '~/connectionResolvers';

const productImportMap = {
  product: {
    fileName: 'products-template.csv',
    headers: [
      { label: 'Code', key: 'code' },
      { label: 'Name', key: 'name' },
      { label: 'Short Name', key: 'shortName' },
      { label: 'Description', key: 'description' },
      {
        label: 'Unit Price',
        key: 'unitPrice',
        dataType: 'number' as const,
        example: '1234.5',
      },
      { label: 'UOM', key: 'uom' },
      { label: 'Category ID', key: 'categoryId' },
      { label: 'Vendor ID', key: 'vendorId' },
      {
        label: 'Status',
        key: 'status',
        dataType: 'select' as const,
        options: PRODUCT_STATUSES.ALL,
        example: PRODUCT_STATUSES.ALL.join(' | '),
      },
      {
        label: 'Tags',
        key: 'tags',
        dataType: 'multiSelect' as const,
        example: 'Seasonal, Bestseller',
      },
      {
        label: 'Type',
        key: 'type',
        dataType: 'select' as const,
        options: PRODUCT_TYPES.ALL,
        example: PRODUCT_TYPES.ALL.join(' | '),
      },
      {
        label: 'Barcodes',
        key: 'barcodes',
        dataType: 'multiSelect' as const,
        example: '4820000001, 4820000002',
      },
    ],
    processRows: (models: IModels, rows: any[]) =>
      processProductRows(models, rows),
  },
};
export const productImportHandlers = {
  getImportHeaders: async (
    { collectionName }: { collectionName: string },
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ): Promise<TGetImportHeadersOutput> => {
    const handler = productImportMap[collectionName];
    if (!handler)
      throw new Error(`Import headers handler not found for ${collectionName}`);
    return handler.headers;
  },
  insertImportRows: async (
    { collectionName, rows }: TInsertImportRowsInput,
    { models }: TCoreModuleProducerContext<IModels>,
  ) => {
    const handler = productImportMap[collectionName];
    if (!handler)
      throw new Error(`Import handler not found for ${collectionName}`);
    return handler.processRows(models, rows);
  },
};
