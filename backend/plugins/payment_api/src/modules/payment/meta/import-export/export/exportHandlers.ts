import {
  TExportHandlers,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { getInvoiceExportHeaders } from './getInvoiceExportHeaders';
import { getInvoiceExportData } from './getInvoiceExportData';

const invoiceExportMap = {
  invoice: {
    getExportHeaders: getInvoiceExportHeaders,
    getExportData: getInvoiceExportData,
  },
};

export const invoiceExportHandlers: TExportHandlers = {
  getExportHeaders: async (data: any, ctx: IImportExportContext) => {
    const collectionName = data?.collectionName ?? data?.data?.collectionName;
    const handler =
      invoiceExportMap[collectionName as keyof typeof invoiceExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.collectionName ?? args?.data?.collectionName;
    const handler =
      invoiceExportMap[collectionName as keyof typeof invoiceExportMap]
        ?.getExportData;
    if (!handler)
      throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args, ctx);
  },
};
