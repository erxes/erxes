import {
  TExportHandlers,
  IImportExportContext,
  GetExportDataArgs,
} from 'erxes-api-shared/core-modules';
import { getPosItemsExportHeaders } from './getPosItemsExportHeaders';
import { getPosItemsExportData } from './getPosItemsExportData';

type ExportHeadersArgs = Parameters<TExportHandlers['getExportHeaders']>[0];

const posExportMap = {
  posItems: {
    getExportHeaders: getPosItemsExportHeaders,
    getExportData: getPosItemsExportData,
  },
};

export const posExportHandlers: TExportHandlers = {
  getExportHeaders: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.data?.collectionName ?? args?.collectionName;
    const handler =
      posExportMap[collectionName as keyof typeof posExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for ${collectionName}`);
    return await handler(args, ctx);
  },
  getExportData: async (args: any, ctx: IImportExportContext) => {
    const collectionName = args?.data?.collectionName ?? args?.collectionName;
    const handler =
      posExportMap[collectionName as keyof typeof posExportMap]?.getExportData;
    if (!handler)
      throw new Error(`Export handler not found for ${collectionName}`);
    return await handler(args, ctx);
  },
};
