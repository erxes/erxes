import {
  TExportHandlers,
  IImportExportContext,
  GetExportDataArgs,
} from 'erxes-api-shared/core-modules';
import { getDealExportHeaders } from './getDealExportHeaders';
import { getDealExportData } from './getDealExportData';

type ExportHeadersArgs = Parameters<TExportHandlers['getExportHeaders']>[0];

const dealExportMap = {
  deal: {
    getExportHeaders: getDealExportHeaders,
    getExportData: getDealExportData,
  },
};

export const dealExportHandlers: TExportHandlers = {
  getExportHeaders: (args: ExportHeadersArgs, ctx: IImportExportContext) => {
    const collectionName = (args as any)?.collectionName ?? args?.data?.collectionName;
    const handler =
      dealExportMap[collectionName as keyof typeof dealExportMap]
        ?.getExportHeaders;
    if (!handler)
      throw new Error(`Export headers handler not found for "${collectionName}"`);
    return handler(args, ctx);
  },
  getExportData: (args: GetExportDataArgs, ctx: IImportExportContext) => {
    const collectionName = (args as any)?.collectionName ?? (args?.data as any)?.collectionName;
    const handler =
      dealExportMap[collectionName as keyof typeof dealExportMap]?.getExportData;
    if (!handler)
      throw new Error(`Export data handler not found for "${collectionName}"`);
    return handler(args, ctx);
  },
};
