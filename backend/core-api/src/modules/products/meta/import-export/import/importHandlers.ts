import {
  PRODUCT_DURATION_TYPES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
} from '~/modules/products/constants';
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
      { label: 'Code', key: 'code', required: true },
      { label: 'Name', key: 'name' },
      { label: 'Short Name', key: 'shortName' },
      { label: 'Description', key: 'description' },
      {
        label: 'Unit Price',
        key: 'unitPrice',
        dataType: 'number' as const,
        example: '1234.5',
      },
      {
        label: 'UOM',
        key: 'uom',
        example: 'Code or name; created if missing',
      },
      {
        label: 'Category',
        key: 'categoryId',
        aliases: ['Category ID', 'Category Code'],
        example: 'Category code, name or ID',
      },
      {
        label: 'Vendor',
        key: 'vendorCode',
        aliases: ['Vendor ID', 'Vendor Code'],
        example: 'Company code, email, phone, name or ID',
      },
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
        label: 'Duration',
        key: 'duration',
        dataType: 'number' as const,
        example: '30 (unique products only)',
      },
      {
        label: 'Duration Type',
        key: 'durationType',
        dataType: 'select' as const,
        options: PRODUCT_DURATION_TYPES.ALL,
        example: PRODUCT_DURATION_TYPES.ALL.join(' | '),
      },
      {
        label: 'Barcodes',
        key: 'barcodes',
        dataType: 'multiSelect' as const,
        example: '4820000001, 4820000002',
      },
      {
        label: 'Image',
        key: 'image',
        aliases: ['Image URL'],
        example: 'https://example.com/product.jpg',
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
