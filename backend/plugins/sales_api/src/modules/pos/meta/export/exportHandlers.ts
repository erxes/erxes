import {
  GetExportData,
  IImportExportContext,
  TExportHandlers,
} from 'erxes-api-shared/core-modules';
import { unwrapExportPayload } from '~/meta/export/utils';
import { getPosItemsExportHeaders } from './getPosItemsExportHeaders';
import { getPosItemsExportData } from './getPosItemsExportData';
import { getPosOrdersExportHeaders } from './getPosOrdersExportHeaders';
import { getPosOrdersExportData } from './getPosOrdersExportData';

type ExportHeadersArgs = Parameters<TExportHandlers['getExportHeaders']>[0];
type ExportDataArgs = Parameters<TExportHandlers['getExportData']>[0];

const posExportMap: Record<string, TExportHandlers> = {
  posItems: {
    getExportHeaders: getPosItemsExportHeaders,
    getExportData: getPosItemsExportData,
  },
  posOrders: {
    getExportHeaders: getPosOrdersExportHeaders,
    getExportData: getPosOrdersExportData,
  },
};

const getHandler = (collectionName?: string): TExportHandlers => {
  const handler = collectionName ? posExportMap[collectionName] : undefined;

  if (!handler) {
    throw new Error(`POS export handler not found for "${collectionName}"`);
  }

  return handler;
};

export const posExportHandlers: TExportHandlers = {
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
