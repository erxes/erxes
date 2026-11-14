import {
  GetExportData,
  IImportExportContext,
  TExportHandlers,
} from 'erxes-api-shared/core-modules';
import { unwrapExportPayload } from '~/meta/export/utils';
import { getDealExportData } from './getDealExportData';
import { getDealExportHeaders } from './getDealExportHeaders';

type ExportHeadersArgs = Parameters<TExportHandlers['getExportHeaders']>[0];
type ExportDataArgs = Parameters<TExportHandlers['getExportData']>[0];

const salesExportMap: Record<string, TExportHandlers> = {
  deals: {
    getExportHeaders: getDealExportHeaders,
    getExportData: getDealExportData,
  },
};

const getHandler = (collectionName?: string): TExportHandlers => {
  const handler = collectionName ? salesExportMap[collectionName] : undefined;

  if (!handler) {
    throw new Error(`Sales export handler not found for "${collectionName}"`);
  }

  return handler;
};

export const salesExportHandlers: TExportHandlers = {
  getExportHeaders: (args: ExportHeadersArgs, ctx: IImportExportContext) => {
    const { collectionName } =
      unwrapExportPayload<ExportHeadersArgs['data']>(args);

    return getHandler(collectionName).getExportHeaders(args, ctx);
  },
  getExportData: (args: ExportDataArgs, ctx: IImportExportContext) => {
    const { collectionName } = unwrapExportPayload<GetExportData>(args);

    return getHandler(collectionName).getExportData(args, ctx);
  },
};
