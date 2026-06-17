import {
  TExportHandlers,
  GetExportData,
} from 'erxes-api-shared/core-modules';
import { getInvoiceExportHeaders } from './getInvoiceExportHeaders';
import { getInvoiceExportData } from './getInvoiceExportData';

const invoiceExportMap = {
  invoice: {
    getExportHeaders: getInvoiceExportHeaders,
    getExportData: getInvoiceExportData,
  },
};

/**
 * The export worker may deliver the payload either flattened or wrapped in a
 * `data` envelope, so resolve the collection name from both shapes.
 */
const resolveCollectionName = (payload: unknown): string | undefined => {
  const raw = payload as {
    collectionName?: string;
    data?: { collectionName?: string };
  };
  return raw?.collectionName ?? raw?.data?.collectionName;
};

export const invoiceExportHandlers: TExportHandlers = {
  getExportHeaders: async (data, ctx) => {
    const collectionName = resolveCollectionName(data);
    const handler =
      invoiceExportMap[collectionName as keyof typeof invoiceExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for ${collectionName}`);
    return handler(data, ctx);
  },
  getExportData: async (args, ctx) => {
    const collectionName = resolveCollectionName(args);
    const handler =
      invoiceExportMap[collectionName as keyof typeof invoiceExportMap]
        ?.getExportData;
    if (!handler)
      throw new Error(`Export handler not found for ${collectionName}`);
    return handler(args as unknown as GetExportData, ctx);
  },
};
