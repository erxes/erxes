import { TCoreModuleProducerContext, TInsertImportRowsInput, TGetImportHeadersOutput } from 'erxes-api-shared/core-modules';
import { processProductRows } from './processProductRows';
import { IModels } from '~/connectionResolvers';

const productImportMap = {
  product: {
    headers: [
      { label: 'Name', key: 'name' },
      { label: 'Short Name', key: 'shortName' },
      { label: 'Code', key: 'code' },
      { label: 'Description', key: 'description' },
      { label: 'Unit Price', key: 'unitPrice' },
      { label: 'UOM', key: 'uom' },
      { label: 'Category ID', key: 'categoryId' },
      { label: 'Vendor ID', key: 'vendorId' },
      { label: 'Status', key: 'status' },
      { label: 'Tags', key: 'tags' },
    ],
    processRows: (models: IModels, rows: any[]) => processProductRows(models, rows),
  },
};
export const productImportHandlers = {
    getImportHeaders: async (
      { collectionName }: { collectionName: string },
      { subdomain }: TCoreModuleProducerContext<IModels>,
    ): Promise<TGetImportHeadersOutput> => {
      return productImportMap[collectionName].headers;
    },
    insertImportRows: async (
      { collectionName, rows }: TInsertImportRowsInput,
      { models }: TCoreModuleProducerContext<IModels>,
    ) => await productImportMap[collectionName].processRows(models, rows),
  };
  