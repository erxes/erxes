// modules/products/meta/import-export/export/exportHandlers.ts
import { TExportHandlers, IImportExportContext } from 'erxes-api-shared/core-modules';
import { getProductExportHeaders } from './getProductExportHeaders';
import { getProductExportData } from './getProductExportData';

const productExportMap = {
  product: {
    getExportHeaders: getProductExportHeaders,
    getExportData: getProductExportData,
  },
};

export const productExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const collectionName = data?.collectionName ?? data?.data?.collectionName;
    const handler = productExportMap[collectionName]?.getExportHeaders;
    if (!handler) throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.collectionName ?? args?.data?.collectionName;
    const handler = productExportMap[collectionName]?.getExportData;
    if (!handler) throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args, ctx);
  },
};
