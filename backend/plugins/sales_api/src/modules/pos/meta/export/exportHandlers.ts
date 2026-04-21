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
  getExportHeaders: (args: ExportHeadersArgs, ctx: IImportExportContext) => {
    const collectionName = args?.data?.collectionName;
    const handler =
      posExportMap[collectionName as keyof typeof posExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for "${collectionName}" (type: ${typeof collectionName})`);
    return handler(args, ctx);
  },
  getExportData: (args: GetExportDataArgs, ctx: IImportExportContext) => {
    const collectionName = (args?.data as { collectionName?: string })?.collectionName;
    const handler =
      posExportMap[collectionName as keyof typeof posExportMap]?.getExportData;
    if (!handler)
      throw new Error(`Export data handler not found for "${collectionName}" (type: ${typeof collectionName})`);
    return handler(args, ctx);
  },
};
